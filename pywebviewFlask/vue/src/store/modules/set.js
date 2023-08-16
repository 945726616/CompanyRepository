//存储设置信息
const set = {
    state: {
        pageParams: '', //接受的设置的信息
        motionTrack: '', //移动轨迹
        deviceEalf: 0,
    },
    mutations: {
        SET_PAGE_PARAMS: (state, pageParams) => {
            state.pageParams = pageParams
        },
        SET_MOTION_TRACK: (state, motionTrack) => {
            state.motionTrack = motionTrack
        },
        SET_DEVICE_EALF: (state, deviceEalf) => {
          state.deviceEalf = deviceEalf
        }
    },
    actions: {
        setPageParams: ({ commit }, pageParams) => commit('SET_PAGE_PARAMS', pageParams),
        setMotionTrack: ({ commit }, motionTrack) => commit('SET_MOTION_TRACK', motionTrack),
        setDeviceEalf: ({commit}, deviceEalf) => commit('SET_DEVICE_EALF', deviceEalf)
    }
}

export default set