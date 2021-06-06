require('jsdom-global')() // NOTE: must import at first
const { mount } = require('@vue/test-utils')
const Logo = require('@/components/Logo.vue')

describe('Logo', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Logo)
    expect(wrapper.vm).toBeTruthy()
  })
})
