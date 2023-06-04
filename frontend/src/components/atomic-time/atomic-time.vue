<template>
  <div class="atomic-time">
    {{ formattedTime }} UTC
    <q-tooltip>
      Coordinated Universal Time - 5 hours before New York Time
    </q-tooltip>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const formattedTime = ref('');

    const getAtomicTime = () => {
      axios.get('https://worldtimeapi.org/api/ip').then((response) => {
        const currentTime = new Date(response.data.utc_datetime);
        formattedTime.value = currentTime
          .toISOString()
          .split('T')[1]
          .slice(0, 8);
      });
    };

    onMounted(() => {
      getAtomicTime();
      setInterval(getAtomicTime, 1000); // Update the time every second
    });

    return {
      formattedTime,
    };
  },
};
</script>

<style lang="scss" scoped>
.atomic-time {
  font-size: 11px;
}
</style>
