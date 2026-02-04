import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import storyData from '../data/story.json'
import type { Story } from "../types/game.types"

export default function useGameState() {
    const loadStory = useGameStore(state => state.loadStory)

    useEffect(() => {
        loadStory(storyData as Story)
    }, [loadStory])
}
