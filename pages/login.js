import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const router = useRouter()
  const { user, login, forgotPassword } = useAuth()
  const [data, setData] = useState({
    email: '',
    password: '',
  })
  const [forgotPass, setForgotPass] = useState('')
  const [isForgotOpen, setIsForgotOpen] = useState(false)

  if (user) {
    router.push('/')
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      await login(data.email, data.password)
    } catch (err) {
    }
  }

  const forgotPassHandler = (e) => {
    e.preventDefault()

    forgotPassword(forgotPass)
  }

  if (!user) {
  return (

      <div className='w-3/4 flex h-[90vh] flex-col items-center justify-center mx-auto'>
        {isForgotOpen && (
          <div className='fixed top-0 left-0 w-full h-screen flex items-center justify-center z-50'>
            <div className='fixed top-0 left-0 w-full h-screen bg-black bg-opacity-10' onClick={() => setIsForgotOpen(false)}></div>
            <form onSubmit={(e) => forgotPassHandler(e)} className='bg-white w-96 h-72 z-50 flex-col gap-4 rounded-lg px-6 flex items-center justify-center'>
              <h3 className='font-semibold mb-4 text-lg'>Reset password</h3>
              <input type="email"
              placeholder="E-mail"
              required
              className='bg-gray-100 py-3 pl-4 w-full rounded text-gray-600 text-sm font-semibold focus:outline-none transition focus:bg-gray-200'
              onChange={(e) =>
                setForgotPass(e.target.value)
              }
              value={forgotPass} />
              <input type="submit" value="Send Code" className='bg-gray-900 cursor-pointer text-white text-sm font-semibold py-3 rounded w-full transition disabled:bg-gray-300' disabled={!forgotPass} />
            </form>
          </div>
        )}

      <form className='flex flex-col gap-4 w-80 items-center' onSubmit={handleLogin}>
          <div className='flex flex-col items-center justify-center gap-1'>
            <p className="text-center text-gray-400 text-sm">Sign in to your account.</p>
            <h1 className="text-4xl font-bold text-center mb-4">Sign In</h1>
          </div>
          
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

            <span className='text-left text-xs mb-1 -mt-1 font-semibold text-gray-500 self-end cursor-pointer' onClick={() => setIsForgotOpen(true)} >Forgot password?</span>

          <input type="submit" value="Sign In" className='bg-gray-900 cursor-pointer text-white text-sm font-semibold py-3 rounded w-40 transition disabled:bg-gray-300' disabled={!data.email || !data.password} />
      </form>
    </div>





  )
  }
}

export default Login