const initState = {
    markers: []
}
export default function reducer (state = initState, action) {
  //console.log(action)
  switch (action.type) {
    case 'markers':
      state.markers = action.markers
      return state
    default:
      return state
  }
}