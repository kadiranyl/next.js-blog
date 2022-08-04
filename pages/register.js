import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'


const Signup = () => {
  const router = useRouter()

  const { user, signup } = useAuth()
  const [data, setData] = useState({
    displayName: '',
    email: '',
    password: '',
  })

  if (user) {
    router.push('/')
  }


  const handleSignup = async (e) => {
    e.preventDefault()

    try {
      await signup(data.displayName, data.email, data.password)
    } catch (err) {
      toast(err)
    }

  }

  if (!user) {
  return (
    <div className='w-3/4 flex h-[90vh] flex-col items-center justify-center mx-auto'>


      <form className='flex flex-col gap-4 w-80 items-center' onSubmit={handleSignup}>
        <div className='flex flex-col items-center justify-center gap-1'>
            <p className="text-center text-gray-400 text-sm">Sign up and join around us.</p>
            <h1 className="text-4xl font-bold text-center mb-4">Sign Up</h1>
          </div>
          
          <input
          type="text"
          placeholder="Enter username"
          required
          className='bg-gray-100 py-3 pl-4 w-full rounded text-gray-600 text-sm font-semibold focus:outline-none transition focus:bg-gray-200'
          onChange={(e) =>
            setData({
              ...data,
              displayName: e.target.value,
            })
          }
          value={data.displayName} />
          
          <input
          type="email"
          placeholder="Enter email"
          required
          className='bg-gray-100 py-3 pl-4 w-full rounded text-gray-600 text-sm font-semibold focus:outline-none transition focus:bg-gray-200'
          onChange={(e) =>
            setData({
              ...data,
              email: e.target.value,
            })
          }
          value={data.email} />

          <input type="password"
            placeholder="Password"
            required
            className='bg-gray-100 py-3 pl-4 w-full rounded text-gray-600 text-sm font-semibold focus:outline-none transition focus:bg-gray-200'
            onChange={(e) =>
              setData({
                ...data,
                password: e.target.value,
              })
            }
            value={data.password} />

          <input type="submit" value="Sign Up" className='bg-gray-900 text-white cursor-pointer text-sm font-semibold py-3 rounded w-40 transition disabled:bg-gray-300' disabled={!data.email || !data.password} />
      </form>
    </div>
  )
  }
}

export default Signup