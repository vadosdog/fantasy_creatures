// Где необходимо условие вызывается someCondition(...params)
// В ответ возвращается функция, в которую в последствии необходимо будет передать gameStore и вернутся bool

export const conditions = {
    requireMeetNpc(npcId) {
        return (state) => {
            return state.metNpcs.includes(npcId)
        }
    }
}