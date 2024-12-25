<template>
    <div class="calendar">
      <div class="month">
        <ul>
          <li class="prev" @click="prevMonth">❮</li>
          <li class="next" @click="nextMonth">❯</li>
          <li style="text-align:center">
            {{ monthName }}<br>
            <span style="font-size:18px">{{ year }}</span>
          </li>
        </ul>
      </div>
  
      <ul class="weekdays">
        <li>Mo</li>
        <li>Tu</li>
        <li>We</li>
        <li>Th</li>
        <li>Fr</li>
        <li>Sa</li>
        <li>Su</li>
      </ul>
  
      <ul class="days">
        <li v-for="day in blankDays" :key="'blank-' + day"><span></span></li>
        <li v-for="day in days" :key="day.date" @click="selectDay(day.date)" :class="{ 'active': day.isToday, 'other-month': day.isOtherMonth }">
          <span>{{ day.date }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays } from 'date-fns';
  
  export default {
    name: 'Calendar',
    setup() {
      const currentDate = ref(new Date());
      const monthName = computed(() => format(currentDate.value, 'MMMM'));
      const year = computed(() => currentDate.value.getFullYear());
      const days = computed(() => {
        const start = startOfMonth(currentDate.value);
        const end = endOfMonth(currentDate.value);
        const days = eachDayOfInterval({ start, end });
        return days.map(day => ({
          date: format(day, 'd'),
          isToday: format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
          isOtherMonth: getDay(day) === 0 || getDay(day) === 6
        }));
      });
      const blankDays = computed(() => {
        const start = startOfMonth(currentDate.value);
        const days = eachDayOfInterval({ start: addDays(start, -1 * getDay(start)), end: start });
        return days.map(day => ({ date: format(day, 'd') }));
      });
  
      const prevMonth = () => {
        currentDate.value = addDays(currentDate.value, -1);
      };
  
      const nextMonth = () => {
        currentDate.value = addDays(currentDate.value, 1);
      };
  
      const selectDay = (date) => {
        console.log('Date clicked:', date);
      };
  
      return {
        monthName,
        year,
        days,
        blankDays,
        prevMonth,
        nextMonth,
        selectDay
      };
    }
  };
  </script>
  
  <style scoped>
  .calendar {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .month {
    padding: 20px;
    background-color: #f0f0f0;
    text-align: center;
  }
  
  .month ul {
    list-style: none;
    display: flex;
    justify-content: space-between;
  }
  
  .month ul li {
    padding: 10px;
    cursor: pointer;
  }
  
  .weekdays {
    background-color: #ddd;
    padding: 10px 0;
  }
  
  .weekdays li,
  .days li {
    display: inline-block;
    width: 14.28%;
    text-align: center;
    padding: 5px;
    cursor: pointer;
  }
  
  .days li .active {
    background-color: #1abc9c;
    color: white;
  }
  </style>