import type { Ending, GameState } from '../types/game.types'

/**
 * ENDINGS registry for "Mùa ôn thi"
 *
 * Mỗi ending có một `condition` (runtime) để kiểm tra xem trạng thái game có thỏa
 * để trigger ending đó hay không.
 *
 * Lưu ý:
 * - Các flag bổ trợ (ví dụ `cheat_caught`, `miracle_survivor`, `lucky_guess`) có thể
 *   được set trong runtime/logic đánh giá (ví dụ khi xử lý hành động gian lận,
 *   khoanh bừa, hoặc random result). Nếu không có, các ending dựa chủ yếu vào stats.
 * - Thứ tự trong mảng ENDINGS là thứ tự ưu tiên kiểm tra — hàm checkEnding sẽ
 *   trả về ending đầu tiên khớp.
 */

export const ENDINGS: Ending[] = [
    // 1) BAD - Ambulance (sức khỏe tới ngưỡng nguy hiểm)
    {
        id: 'bad_ambulance',
        title: 'Xe Cấp Cứu 115',
        description:
            'Bạn bị kiệt sức/ngã trong phòng thi do sức khỏe <= 0 hoặc thức quá sức. Sức khỏe là vốn quý nhất.',
        achievements: [],
        condition: (state: GameState) => {
            return state.stats.health <= 0 || state.stats.sleepless_count >= 2
        },
    },

    // 2) BAD - Hospital midgame (bị nhập viện giữa chừng do lạm dụng)
    {
        id: 'bad_hospital_mid',
        title: 'Nhập Viện Giữa Chừng',
        description:
            'Bạn phải nhập viện giữa kỳ (Day 3/5/6) do thiếu ngủ hoặc sức khỏe suy giảm. Ngày ôn bị bỏ lỡ, hậu quả nặng.',
        achievements: [],
        condition: (state: GameState) => {
            return !!(
                state.flags.hospitalized_day3 ||
                state.flags.hospitalized_day5 ||
                state.flags.hospitalized_day6
            )
        },
    },

    // 3) BAD - Cheat caught (gian lận bị phát hiện)
    {
        id: 'bad_cheat_caught',
        title: 'Cái Giá Của Tự Do',
        description:
            'Bạn bị bắt gian lận trong thi. Hậu quả: đình chỉ, xấu hổ và mất một năm học. Một quyết định sai lầm phá hủy tương lai gần.',
        achievements: [],
        condition: (state: GameState) => {
            return state.flags.cheat_caught === true
        },
    },

    // 4) BEST - High knowledge + good health
    {
        id: 'best_ending',
        title: 'Nhà Triết Học Trẻ',
        description:
            'Bạn đã chứng minh: Nỗ lực + phương pháp đúng = Thành công. Bạn đạt điểm xuất sắc và nhận học bổng.',
        achievements: ['Perfect Student', 'Iron Will', "Philosopher's Path"],
        condition: (state: GameState) => {
            return state.stats.knowledge > 80 && state.stats.health > 50
        },
    },

    // 5) GOOD - Stable pass
    {
        id: 'good_ending',
        title: 'Qua Môn An Toàn',
        description:
            'Bạn qua môn ở mức an toàn. Không xuất sắc nhưng đủ để tiến lên. Kiên trì và ổn định là chìa khóa.',
        achievements: ['Survivor', 'Balanced Life'],
        condition: (state: GameState) => {
            return state.stats.knowledge >= 50 && state.stats.knowledge <= 79
        },
    },

    // 6) MIRACLE - Lucky guess (khoanh bừa thành công)
    {
        id: 'miracle_ending',
        title: 'Thánh Nhân Đãi Kẻ Khù Khờ',
        description:
            'Bạn khoanh bừa may mắn và qua môn một cách thần kỳ. May mắn không bền vững — bài học là đừng trông chờ vào điều này mãi.',
        achievements: ['Miracle Survivor'],
        condition: (state: GameState) => {
            // This ending can be triggered if a runtime flag for lucky-guess is set
            // (e.g., engine ran a random check and set `lucky_guess` or `miracle_survivor`).
            return !!state.flags.miracle_survivor || !!state.flags.lucky_guess
        },
    },

    // 7) NEUTRAL - Cheat success (đậu nhờ phao, nhưng kết quả giả tạo)
    {
        id: 'neutral_ending',
        title: 'Kẻ Lừa Dối May Mắn',
        description:
            'Bạn qua môn nhờ phao/giúp đỡ. Điểm đạt được nhưng đó là chiến thắng giả tạo — bạn không thu được kiến thức thực sự.',
        achievements: ['Lucky Cheater', 'Guilty Conscience'],
        condition: (state: GameState) => {
            // Trigger when player had a cheat-sheet AND was not caught, and knowledge is low.
            // The runtime evaluation should set `cheat_caught` flag if caught; if not set,
            // and player had cheat, they can land here when knowledge is insufficient.
            return !!state.flags.has_cheat_sheet && !state.flags.cheat_caught && state.stats.knowledge < 50
        },
    },

    // 8) BAD - Fail & retake (hoc lai)
    {
        id: 'bad_fail',
        title: 'Học Lại Là Chân Ái',
        description:
            'Bạn trượt môn do thiếu kiến thức. Phải học lại kỳ sau. May mắn không thay thế cho nỗ lực.',
        achievements: [],
        condition: (state: GameState) => {
            // If knowledge is low and none of the special luck/cheat-success conditions applied,
            // this is the fallback fail ending.
            return state.stats.knowledge < 50 && !state.flags.miracle_survivor && !(state.flags.has_cheat_sheet && !state.flags.cheat_caught)
        },
    },
]

/**
 * checkEnding(state): kiểm tra ENDINGS theo thứ tự ưu tiên và trả về
 * ending đầu tiên khớp hoặc null nếu không có ending nào match.
 */
export const checkEnding = (state: GameState): Ending | null => {
    for (const end of ENDINGS) {
        try {
            if (end.condition(state)) return end
        } catch (err) {
            // ignore condition errors but log for debugging
            // (runtime condition functions might reference properties that were not set)
            // eslint-disable-next-line no-console
            console.warn('checkEnding: condition threw for', end.id, err)
        }
    }
    return null
}

export default ENDINGS;