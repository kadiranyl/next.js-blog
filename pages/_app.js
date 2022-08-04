import '../styles/globals.css'
import { AuthContextProvider, useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import NavbarComp from '../components/Navbar'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc } from 'firebase/firestore';
import {
  onAuthStateChanged,
} from 'firebase/auth'
import { firestore, auth } from '../lib/firebase'
import Link from 'next/link'
import { FaPen } from 'react-icons/fa'
import { GrUserAdmin } from 'react-icons/gr'
import { MdCategory } from 'react-icons/md'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  const { user } = useAuth()

  const authRequired = ['/profile-settings']
  const adminRequired = ['/admin', '/admin/categories', '/admin/blogs']

  const [fireUser, setFireUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {          
        const getFirebaseData = async () => {
          const docRef = doc(firestore, "accounts", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);

          setFireUser(docSnap.data())

          setIsAdmin(docSnap.data().isAdmin)

          if (docSnap.exists()) {
          } else {
            // doc.data() will be undefined in this case
          }
        }

        getFirebaseData()


      } else {
        setFireUser(null)
        setIsAdmin(false)
      }
    })

    return () => unsubscribe()
  }, [isAdmin])
  


  useEffect(() => {
    
    // if (auth.currentUser === null && adminRequired.includes(router.pathname)) {
    //   router.push('/')
    // } else if (!(isAdmin !== null) && adminRequired.includes(router.pathname)) {
    //   if (isAdmin === false) {
    //     router.push('/')
    //   }
    // }


  }, [auth]) 

    return (
      <AuthContextProvider>
        <ToastContainer
        />

        {isAdmin && (
          <div className='w-full flex items-center h-[5vh] justify-center font-semibold text-sm bg-gray-200 py-2'>
            <div className='w-3/4 flex items-center justify-between'>
              <Link href="/admin">
                <a className='flex items-center justify-center gap-2 text-gray-500'>
                  <GrUserAdmin size={14} />
                  Admin
                </a>
              </Link>
              <div className='flex items-center justify-center gap-6'>
              <Link href="/admin/blogs">
                <a className='flex items-center justify-center gap-2 font-semibold text-sm text-gray-500'>
                  <FaPen size={14} />
                  Blogs
                </a>
              </Link>
              <Link href="/admin/categories">
                <a className='flex items-center justify-center gap-2 font-semibold text-sm text-gray-500'>
                  <MdCategory size={14} />
                  Categories
                </a>
              </Link>
              </div>
            </div>
          </div>
        )}
  
        <NavbarComp fireUser={fireUser} />
        {adminRequired.includes(router.pathname) && !isAdmin ? (
          <></>
        ) : (
          <Component {...pageProps} isAdmin={isAdmin} fireUser={fireUser} />
        )}
      </AuthContextProvider>
    )
}

export default MyApp