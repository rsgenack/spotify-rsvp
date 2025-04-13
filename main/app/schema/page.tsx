"use client"

import { useEffect, useState } from 'react'
import styled from 'styled-components'

interface Field {
  id: string
  name: string
  type: string
  options?: any
}

interface Table {
  id: string
  name: string
  fields: Field[]
}

export default function SchemaPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch('/api/airtable-schema')
        if (!response.ok) {
          throw new Error('Failed to fetch schema')
        }
        const data = await response.json()
        setTables(data.tables)
      } catch (err) {
        setError('Error fetching schema')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSchema()
  }, [])

  if (loading) {
    return <div>Loading schema...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <SchemaWrapper>
      <h1>Airtable Schema</h1>
      {tables.map((table) => (
        <div key={table.id} className="table-container">
          <h2>{table.name}</h2>
          <table>
            <thead>
              <tr>
                <th>Field Name</th>
                <th>Field ID</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {table.fields.map((field) => (
                <tr key={field.id}>
                  <td className="field-name">{field.name}</td>
                  <td>{field.id}</td>
                  <td>{field.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </SchemaWrapper>
  )
}

const SchemaWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  h1 {
    margin-bottom: 2rem;
  }
  
  .table-container {
    margin-bottom: 3rem;
    
    h2 {
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2rem;
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.75rem;
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    tr:hover {
      background-color: #f1f1f1;
    }
    
    .field-name {
      font-weight: bold;
    }
  }
` 