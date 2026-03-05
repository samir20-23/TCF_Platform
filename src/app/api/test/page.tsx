'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type TableData = Record<string, any[]>
type Errors = Record<string, string | null>

export default function TestPage() {
  const [tables, setTables] = useState<TableData>({})
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const abortController = new AbortController()
    
    async function load() {
      try {
        const res = await fetch('/api/get-all', {
          signal: abortController.signal,
        })
        if (!res.ok) throw new Error(`API returned ${res.status}`)
        const json = await res.json()
        if (!mounted || abortController.signal.aborted) return
        setTables(json.tables || {})
        setErrors(json.errors || {})
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return // Request was cancelled, ignore
        }
        if (!mounted || abortController.signal.aborted) return
        setFetchError(err?.message ?? 'Failed to fetch')
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      mounted = false
      abortController.abort()
    }
  }, [])

  if (loading) return <p className="text-center mt-20 text-xl text-blue-400">Loading...</p>
  if (fetchError) return <p className="text-center mt-20 text-xl text-red-500">Error: {fetchError}</p>

  const tableNames = Object.keys(tables)

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center mb-8 text-white"
      >
        All Database Tables
      </motion.h1>

      <div className="max-w-7xl mx-auto space-y-10">
        {tableNames.length === 0 && <p className="text-white">No tables found</p>}

        {tableNames.map((tableName, idx) => {
          const rows = tables[tableName] || []
          const tableError = errors[tableName] ?? null
          const cols = rows.length > 0 ? Object.keys(rows[0]) : []

          return (
            <motion.section
              key={tableName}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white/6 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-600 to-indigo-600">
                <h2 className="text-xl font-semibold text-white">{tableName}</h2>
                <div className="text-sm text-white/90">
                  {rows.length} row{rows.length !== 1 ? 's' : ''}
                </div>
              </div>

              {tableError ? (
                <div className="p-6 text-sm text-rose-300">Error: {tableError}</div>
              ) : rows.length === 0 ? (
                <div className="p-6 text-sm text-gray-300">No data in this table</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-white/5">
                        {cols.map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider border-b border-white/6"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6">
                      {rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white/2' : 'bg-transparent'}>
                          {cols.map((col, cIdx) => {
                            const val = row[col]
                            return (
                              <td key={cIdx} className="px-4 py-3 align-top text-sm text-white/90">
                                {val === null || val === undefined ? (
                                  <span className="text-gray-400">null</span>
                                ) : typeof val === 'object' ? (
                                  <pre className="text-xs text-cyan-200 whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>
          )
        })}
      </div>
    </div>
  )
}
