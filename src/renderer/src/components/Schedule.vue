<!-- <template>
  <div class="schedule-container">
    <div class="header">
      <button class="btn" @click="showCalendar = !showCalendar">
        Calendar
      </button>
      <div class="add-task-modal" v-if="showAddTaskModal">
        <div class="modal-content">
          <button class="close" @click="closeAddTaskModal">&times;</button>
          <input v-model="newTask.name" placeholder="Task Name" />
          <textarea v-model="newTask.description" placeholder="Task Description"></textarea>
          <input type="datetime-local" v-model="newTask.deadline" />
          <input type="color" v-model="newTask.color" />
          <button class="task-button" @click="addTask">Add Task</button>
        </div>
      </div>
      <div class="calendar" v-if="showCalendar">
        <Calendar :selected-date="selectedDate" @date-change="handleDateChange" />
      </div>
    </div>

    <button class="add-task-button" @click="showAddTaskModal = true">Add Task</button>

    <div class="tasks-wrapper">
      <div class="task" v-for="task in tasks" :key="task.id" :style="{borderLeftColor: task.color}" :class="{ completed: task.completed }">
        <div class="task-content" @click="completeTask(task)">
          <h3>{{ task.name }}</h3>
          <p>{{ task.description }}</p>
          <small>Deadline: {{ task.deadline }}</small>
          <div class="task-deadline">
            <small>{{ timeUntilDeadline(task.deadline) }}</small>
          </div>
        </div>
        <button class="delete-button" @click="deleteTask(task.id)">x</button>
      </div>
    </div>

    <div class="clock-wrapper">
      <DigitalClock />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import DigitalClock from './DigitalClock.vue';
import Calendar from './Calendar.vue';

export default {
  name: 'Schedule',
  components: {
    DigitalClock,
    Calendar
  },
  setup() {
    const showCalendar = ref(false);
    const showAddTaskModal = ref(false);
    const newTask = ref({name: '', description: '', deadline: '', color: '#000000'});
    const tasks = ref([]);

    const timeUntilDeadline = (deadline) => {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diff = deadlineDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${days} days left`;
    };

    const addTask = () => {
      const id = Date.now();
      tasks.value.push({ ...newTask.value, id, completed: false });
      localStorage.setItem('tasks', JSON.stringify(tasks.value));
      showAddTaskModal.value = false;
      newTask.value = {name: '', description: '', deadline: '', color: '#000000'};
    };

    const deleteTask = (id) => {
      tasks.value = tasks.value.filter(task => task.id !== id);
      localStorage.setItem('tasks', JSON.stringify(tasks.value));
    };

    const completeTask = (task) => {
      task.completed = !task.completed;
      localStorage.setItem('tasks', JSON.stringify(tasks.value));
    };

    const closeAddTaskModal = () => {
      showAddTaskModal.value = false;
    };

    const handleDateChange = (date) => {
      selectedDate.value = new Date(date);
      showCalendar.value = false;
    };

    onMounted(() => {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        tasks.value = JSON.parse(storedTasks);
      }
    });

    return {
      showCalendar,
      showAddTaskModal,
      newTask,
      tasks,
      addTask,
      deleteTask,
      completeTask,
      closeAddTaskModal,
      handleDateChange,
      timeUntilDeadline
    };
  }
};
</script>

<style scoped>
.schedule-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px;
  width: 100%;
  height:100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.btn {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.btn:hover {
  background-color: #368b75;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.add-task-modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: slideIn 0.3s forwards;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close {
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  padding: 5px;
  border-radius: 50%;
  background: #f44336;
  color: white;
}

.close:hover {
  background: #e53935;
}

.add-task-button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
  margin-bottom: 20px;
}

.add-task-button:hover {
  background-color: #368b75;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.tasks-wrapper {
  width: 100%;
  max-width: 600px;
}

.task {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 6px;
  margin: 10px 0;
  padding: 15px;
  width: 90vh;
  border-left: 5px solid #ccc; /* Default color */
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.task:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task .delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
  transition: background-color 0.3s;
}

.task .delete-button:hover {
  background-color: #e53935;
}

.task-input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.task-input,
textarea {
  padding: 10px;
  border: 2px solid #42b983;
  border-radius: 4px;
  margin-bottom: 10px;
  outline: none;
}

.task-button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.task-button:hover {
  background-color: #368b75;
}

.clock-wrapper {
  width: 100%;
  max-width: 300px;
  text-align: center;
  margin-top: 20px;
}

.clock {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.task-content {
  cursor: pointer;
  transition: transform 0.3s, opacity 0.3s;
}

.task-content.completed {
  text-decoration: line-through;
  opacity: 0.5;
  transform: scale(0.9);
}
</style> -->

<template>
  <div class="">
    <iframe
      id="child"
      src="https://ys.mihoyo.com/"
      style="width: 100%; height: 100%"
    ></iframe>
  </div>
</template>

<script setup lang="js">
// import { onMounted } from 'vue';

// onMounted(() => {
//   function changeFrame() {
//     const frameDiv = document.getElementById('child');
//     const deviceWidth = document.body.clientWidth;
//     const deviceHeight = document.body.clientHeight;
//     frameDiv!.style.width = Number(deviceWidth) - 240 + 'px'; //数字是页面布局宽度差值
//     frameDiv!.style.height = Number(deviceHeight) - 64 + 'px'; //数字是页面布局高度差
//   }
//   changeFrame();
//   window.onresize = function () {
//     changeFrame();
//   };
// });
</script>

<style lang="css" scoped></style>

