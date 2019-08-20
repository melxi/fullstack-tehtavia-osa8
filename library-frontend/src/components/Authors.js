import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const ALL_AUTHORS = gql`
{
  allAuthors {
    name
    born
    bookCount
  }
}
`

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: String!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    } 
  }
`

const Authors = (props) => {
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })
  const authors = props.result.data.allAuthors || []
  
  if (!props.show) {
    return null
  }

  const submit = async event => {
    event.preventDefault()
    await editAuthor({
      variables: { name, setBornTo: birthYear }
    })
    
    setName(authors[0].name)
    setBirthYear('')
  }
  
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <select value={name} onChange={({target}) => setName(target.value)}>
            {authors.map(author => {
              return (
                <option key={author.name} value={author.name}>{author.name}</option>
              )
            })}
          </select>
        </div>
        <div>
          <label htmlFor="born">born</label>
          <input 
            type="text" 
            name="born" 
            value={birthYear} 
            onChange={({target}) => setBirthYear(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors