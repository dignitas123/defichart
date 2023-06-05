import axios from 'axios';
import { defineStore } from 'pinia';

interface WorldTime {
  abbreviation: string;
  client_ip: string;
  datetime: string;
  day_of_week: number;
  day_of_year: number;
  dst: boolean;
  dst_from: string;
  dst_offset: number;
  dst_until: string;
  raw_offset: number;
  timezone: string;
  unixtime: number;
  utc_datetime: string;
  utc_offset: string;
  week_number: number;
}

interface WorldTimeResult {
  data: WorldTime;
}

function formatTime(time: Date) {
  return time.toISOString().split('T')[1].slice(0, 8);
}

export const useAtomicTimeStore = defineStore('atomic-time', {
  state: () => ({
    time: new Date(),
    formattedTime: '',
  }),
  getters: {
    getFormattedTime: (state) => state.formattedTime,
  },
  actions: {
    startAtomicClock() {
      this.getAtomicTime();
      setInterval(this.updateAtomicTime, 1000); // Update the time every second
    },
    updateAtomicTime() {
      this.time.setSeconds(this.time.getSeconds() + 1);
      this.formattedTime = formatTime(this.time);
    },
    getAtomicTime() {
      axios
        .get('https://worldtimeapi.org/api/ip')
        .then((result: WorldTimeResult) => {
          this.time = new Date(result.data.utc_datetime);
          this.formattedTime = formatTime(this.time);
        });
    },
  },
});
