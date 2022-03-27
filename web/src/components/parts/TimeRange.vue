<template>
  <div class="flex items-center">
    <select v-model="rangeStart">
      <option v-for="t in timeRange" :key="t">
        {{ t }}
      </option>
    </select>
    <span>〜</span>
    <select v-model="rangeEnd">
      <option v-for="t in timeRange" :key="t">
        {{ t }}
      </option>
    </select>
    <button class="btn btn-regular" @click="update">OK</button>
  </div>
</template>

<script>

const MIN_RANGE = 0
const MAX_RANGE = 24 * 60

function convertToInt (timeString) {
  const arr = timeString.split(':')
  return parseInt(arr[0]) * 60 + parseInt(arr[1])
}

export default {
  name: 'TimeRange',

  props: {
    start: {
      type: String,
      require: true,
      default: '00:00'
    },
    end: {
      type: String,
      require: true,
      default: '24:00'
    },
    blockMinutes: {
      type: Number,
      require: true,
      default: 30
    }
  },

  data () {
    return {
      rangeStart: this.start,
      rangeEnd: this.end
    }
  },

  computed: {
    timeRange () {
      const blockCount = 24 * 60 / this.blockMinutes // min
      // 00:00 - 24:00
      return Array.from({ length: blockCount + 1 }, (_, i) => {
        const h = Math.floor(i * this.blockMinutes / 60)
        const m = i * this.blockMinutes % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      })
    }
  },

  methods: {
    update () {
      const start = convertToInt(this.rangeStart)
      const end = convertToInt(this.rangeEnd)
      if (start < MIN_RANGE || MAX_RANGE < end) {
        return
      }
      if (end <= start) {
        return
      }
      this.$emit('update', { start: this.rangeStart, end: this.rangeEnd })
    },

    reset () {
      this.rangeStart = this.start
      this.rangeEnd = this.end
    }
  }
}
</script>
