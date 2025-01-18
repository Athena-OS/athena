import React, { useMemo, useState } from 'react'
import { useUnmount } from 'react-use'
import { Link } from '@material-ui/core'
import styled from 'styled-components'

import { LevelProps } from '@/types/shared'

enum RadicalLevel {
  Kinda = 'Kinda',
  Pretty = 'Pretty',
  Hecka = 'Hecka',
}

interface RadicalProps {
  isRad?: boolean
  onClick: (e: React.MouseEvent) => void
}

const Wrapper = styled.div<{ bg: 'primary' | 'secondary' }>`
  display: 'block';
  background-color: ${({ bg }) => bg};
`

const RadLink = styled(Link)`
  color: pink;
`

/**
 * Radical component
 */
export const Radical: React.FC<RadicalProps & LevelProps> = ({ level, isRad }) => {
  const [status, setStatus] = useState('')

  const computedRadness = useMemo(() => {
    if (level === RadicalLevel.Hecka) {
      return '🔥'
    } else if (level === RadicalLevel.Pretty) {
      return '👍'
    }
    return null
  }, [level])

  useUnmount(() => {
    window.alert('Bye')
  })

  return (
    <Wrapper>
      <h1>A {level} rad theme</h1>
      <RadLink href='/radical'>Radical theme</RadLink>
      <input value={status} onChange={(evt) => setStatus(evt.target.value)} />
    </Wrapper>
  )
}
