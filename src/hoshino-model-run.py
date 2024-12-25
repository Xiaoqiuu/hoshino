from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from flask import Flask, request, jsonify
from modelscope import snapshot_download

# 初始化 Flask 应用
app = Flask(__name__)

# 源大模型下载
model_dir = snapshot_download('IEITYuan/Yuan2-2B-Mars-hf', cache_dir='./')

# 模型路径
path = model_dir  # 使用下载的实际路径

# 模型数据类型
torch_dtype = torch.bfloat16  # 如果使用支持 bfloat16 的 GPU
# torch_dtype = torch.float16  # 如果使用 P100 GPU

# 加载模型和tokenizer
def load_model():
    print("加载 Tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(path, add_eos_token=False, add_bos_token=False, eos_token='<eod>')
    tokenizer.add_tokens([
        '<sep>', '<pad>', '<mask>', '<predict>', '<FIM_SUFFIX>', '<FIM_PREFIX>', '<FIM_MIDDLE>',
        '<commit_before>', '<commit_msg>', '<commit_after>', '<jupyter_start>', '<jupyter_text>',
        '<jupyter_code>', '<jupyter_output>', '<empty_output>'
    ], special_tokens=True)

    print("加载模型...")
    model = AutoModelForCausalLM.from_pretrained(path, torch_dtype=torch_dtype, trust_remote_code=True).to('cuda' if torch.cuda.is_available() else 'cpu')
    print("模型加载完成。")
    
    return tokenizer, model

# 加载模型和tokenizer
tokenizer, model = load_model()

# 处理前端请求，获取问题，调用模型生成答案
@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json  # 从前端获取输入
    prompt = data.get("prompt", "")  # 提取用户输入

    if not prompt:
        return jsonify({"error": "缺少问题"}), 400

    try:
        # 构建输入
        inputs = tokenizer(prompt, return_tensors="pt").to('cuda' if torch.cuda.is_available() else 'cpu')
        
        # 模型生成答案
        outputs = model.generate(inputs['input_ids'], do_sample=False, max_length=1024)
        
        # 解码生成的输出
        output = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = output.strip().split("<sep>")[-1]

        # 返回生成的结果
        return jsonify({"response": response})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 启动 Flask 服务
if __name__ == '__main__': 
    app.run(host='0.0.0.0', port=5000)