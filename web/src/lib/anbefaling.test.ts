import { describe, expect, it } from 'vitest'
import { toppAnbefalinger, type AndreKandidat, type EgenKandidat } from './anbefaling'

const egen = (id: string, konfidens: EgenKandidat['konfidens'], antall: number): EgenKandidat => ({ id, konfidens, antall })
const andre = (id: string, sikkerhet: AndreKandidat['sikkerhet'], fra: number | null, til: number | null): AndreKandidat => ({ id, sikkerhet, fra, til })

const ids = (l: { data: { id: string } }[]) => l.map((x) => x.data.id)

describe('toppAnbefalinger', () => {
  it('returns three tips', () => {
    const r = toppAnbefalinger([egen('e1', 'solid', 6), egen('e2', 'noe', 3)], [andre('t1', 'hoy', -8, -3), andre('t2', 'middels', -6, -1)], -7)
    expect(r).toHaveLength(3)
  })

  it('ranks solid and some own experience above any tip from others', () => {
    const r = toppAnbefalinger([egen('e2', 'noe', 2), egen('e1', 'solid', 6)], [andre('t1', 'hoy', -8, -3)], -7)
    expect(ids(r)).toEqual(['e1', 'e2', 't1'])
  })

  it('ranks a single own race below a high-confidence tip, but above a medium one', () => {
    const r = toppAnbefalinger([egen('e3', 'ett', 1)], [andre('t1', 'hoy', -8, -3), andre('t3', 'middels', -6, -1)], -7)
    expect(ids(r)).toEqual(['t1', 'e3', 't3'])
  })

  it('breaks ties between others by temperature closeness, unknown range last', () => {
    const r = toppAnbefalinger([], [andre('ukjent', 'hoy', null, null), andre('langt', 'hoy', -20, -14), andre('naer', 'hoy', -9, -5)], -7)
    expect(ids(r)).toEqual(['naer', 'langt', 'ukjent'])
  })

  it('keeps the source on every item, so own and others are never mixed unmarked', () => {
    const r = toppAnbefalinger([egen('e1', 'solid', 6)], [andre('t1', 'hoy', -8, -3)], -7)
    expect(r.map((x) => x.kilde)).toEqual(['min', 'andre'])
  })

  it('returns fewer than three when there is little data', () => {
    expect(toppAnbefalinger([], [], -7)).toEqual([])
  })
})
