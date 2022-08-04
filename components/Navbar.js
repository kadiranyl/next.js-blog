import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import { HiOutlineLogout } from 'react-icons/hi'
import { IoMdSettings } from 'react-icons/io'
import { CgProfile } from 'react-icons/cg'
import Image from 'next/image'

const NavbarComp = ({ isAdmin, fireUser }) => {
  const { user, logout } = useAuth()

  // const router = useRouter()

  const [profileDropdown, setProfileDropdown] = useState(false)


  const handleLogout = () => {

    setProfileDropdown(false)

    logout()

    // .then(() => {
    //   router.reload()
    // })

  }


  if (fireUser !== null || !fireUser) {
  return (
    <div className='h-[10vh] w-3/4 mx-auto py-5 flex items-center justify-between'>
      {profileDropdown && (
        <div className='w-full h-full absolute top-0 left-0 z-40' onClick={() => setProfileDropdown(false)}></div>
      )}
        <Link href="/">
          <span className='text-3xl font-bold cursor-pointer'>acatay<span className='text-gray-500'>.</span></span>
        </Link>
        {user ? (
            <div className='flex relative items-center justify-end w-full'>
                <button onClick={() => setProfileDropdown(!profileDropdown) }>
                  {user.photoURL && (
                    <Image width="32px" height="32px" className="object-cover rounded-full cursor-pointer" src={user.photoURL} alt="" />
                  )}
                </button>
                {profileDropdown && (
                  <div className='absolute top-10 z-50 bg-white shadow-lg w-fit gap-3 py-12 text-gray-400 text-sm font-medium px-6 justify-center rounded-md right-0 flex flex-col'>
                    <div className='flex items-center justify-start gap-3'>
                      <Link href={"/users/" + fireUser.link}>
                        {user.photoURL && (
                          <Image width="40px" height="40px" src={user.photoURL} alt="" className="cursor-pointer object-cover flex-none rounded-full" onClick={() => setProfileDropdown(false) } />
                        )}
                      </Link>
                      <div className='flex flex-col justify-center'>
                        <Link href={"/users/" + fireUser.link}>
                          <h3 className='font-semibold text-black cursor-pointer transition hover:text-gray-600' onClick={() => setProfileDropdown(false) }>{user.displayName}</h3>
                        </Link>
                        <span className='text-xs text-gray-400 max-w-fit'>{user.email}</span>
                      </div>
                    </div>
                    <hr className='border border-solid w-full my-3 border-b-gray-200' />
                    <Link href={"/users/" + fireUser.link}>
                      <a className='flex items-center gap-2 transition hover:text-gray-700' onClick={() => setProfileDropdown(false) }>
                        <CgProfile size="16" />
                        Profile
                      </a>
                    </Link>
                    <Link href="/profile-settings">
                      <a className='flex items-center gap-2 transition hover:text-gray-700' onClick={() => setProfileDropdown(false) }>
                        <IoMdSettings size="16" />
                        Settings
                      </a>
                    </Link>
                    <a className='flex items-center gap-2 mt-4 bg-red-400 cursor-pointer justify-center text-center py-1 rounded-md text-white transition hover:bg-transparent hover:text-red-400 hover:outline hover:outline-red-400' onClick={() => handleLogout() }>
                        <HiOutlineLogout size="16" />
                        Logout
                    </a>
                  </div>
                )}
            </div>
        ) : (
            <div className='flex items-center justify-end w-full gap-4'>
              <Link href="/login" passHref>
                  <a className='outline outline-gray-700 text-gray-700 text-sm font-bold py-2 px-5 rounded-md transition hover:bg-gray-700 hover:text-white'>Login</a>
              </Link>
              <Link href="/register" passHref>
                  <a className='bg-gray-700 outline outline-gray-700 text-sm font-bold text-white py-2 px-5 rounded-md hover:bg-transparent transition hover:text-gray-700'>Sign Up</a>
              </Link>
            </div>
        )}
    </div>
  )
        }
}

export default NavbarComp