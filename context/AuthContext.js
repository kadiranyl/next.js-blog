
import { createContext, useContext, useEffect, useState, Fragment } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth, firestore, storage } from '../lib/firebase'
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react'
import { collection, setDoc, doc, getDocs, updateDoc, getDoc, query, orderBy, limit } from 'firebase/firestore';
import slugify from 'react-slugify';
import { useRouter } from 'next/router';
import BounceLoader from "react-spinners/BounceLoader";
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from 'firebase/storage';
const { DateTime } = require("luxon");


const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fireUser, setFireUser] = useState(null)
  const [fireUsers, setFireUsers] = useState([])
  const [progress, setProgress] = useState(0)
  const [uploadedImgUrl, setUploadedImgUrl] = useState(null)
  const [categoriesArray, setCategoriesArray] = useState([])
  const [lastUsers, setLastUsers] = useState([])



  const router = useRouter()

  const getFireUsers = () => {
    //desc tersten sıralaması için
    getDocs(collection(firestore, 'accounts'))
      .then((data) => {
        setFireUsers(data.docs.map((item) => {
          return { ...item.data(), id: item.id }
        }));
      })
  }
  useEffect(() => {
    getFireUsers();
  }, [])


  const toastSuccess = (msg) => {
    toast.success(msg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  const toastError = (msg) => {
    toast.error(msg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  const toastInfo = (msg) => {
    toast.info(msg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
        setFireUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])


  const date = new Date()

  const signup = (displayName, email, password) => {

    const id = makeid(15)

    getDoc(doc(firestore, "blogs", id))
    .then((data) => {
      if (data.exists()) {
        id = makeid(15)
      }
    })

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {

        setDoc(doc(collection(firestore, 'accounts'), auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          isAdmin: false,
          displayName,
          email,
          id,
          createdAt: date,
          link: slugify(displayName.toLocaleLowerCase()) + "-" + id,
          imageUrl: '/img/defaultUser.jpeg',
          biography: null,
          socialMedia: {
            facebook: null,
            instagram: null,
            twitter: null,
          },
          filterDate: DateTime.now().toUnixInteger(),
        })

        updateProfile(auth.currentUser, { displayName: displayName, photoURL: '/img/defaultUser.jpeg' })

        toastSuccess("You've succesfully signed up!")
      })
      .catch((err) => {
        toastError(err.message)
      })

  }

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        toastSuccess("You've succesfully signed in!")
      })
      .catch((err) => {
        toastError(err.message)
      })
  }

  const reAuth = async () => {
    try {
      const credential = await EmailAuthProvider.credential(
        auth.currentUser.email,
        data.password
      )
      return reauthenticateWithCredential(auth.currentUser, credential)

        .then(() => {
          toastSuccess("You've succesfully signed in!")
        })
    }
    catch {
      (err) => {
        toastError(err.message)
      }
    }
  }

  const getUser = async () => {
    if (auth.currentUser !== null) {
      const docRef = doc(firestore, "accounts", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      setFireUser(docSnap.data())
    }
  }

  useEffect(() => {
    getUser()
  }, [auth])

  const update = async ({ displayName, biography}) => {

    try {
      await updateProfile(auth.currentUser, { displayName: displayName })


      const account = await getDoc(doc(firestore, "accounts", auth.currentUser.uid))

      updateDoc(doc(firestore, 'accounts', auth.currentUser.uid), {
        displayName,
        link: slugify(displayName.toLocaleLowerCase()) + "-" + account.data().id,
        biography
      })
      toastSuccess("Your informations successfuly updated.")
      return true
    } catch (err) {
      toastError(err.message)
    }
  }

  const socialMediaUpdate = async ({ facebook, instagram, twitter }) => {

    try {
      updateDoc(doc(firestore, 'accounts', auth.currentUser.uid), {
        socialMedia: {
          facebook,
          instagram,
          twitter
        }
      })
        .then(() => {
          toastSuccess("Your social media informations successfuly updated.")
          return true
        })
    } catch (err) {
      toastError(err.message)
    }
  }





  const handleVerification = async () => {
    try {
      await sendEmailVerification(user)
      toastInfo("Email verification sent to " + user.email)
      return true
    } catch (err) {
      toastError(err.message)
    }
  }

  const handlePassUpdate = async (newPassword) => {
    try {
      await updatePassword(auth.currentUser, newPassword)
      toastSuccess("Your password succesfully updated!")
      return true
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setIsModalOpen(true)
      } else {
        toastError(err.message)
      }
    }
  }

  const logout = async () => {
    setUser(null)
    await signOut(auth)
      .then(() => {
        toastSuccess('Logout is succesfull.')
      })

  }

  const forgotPassword = async (forgotPass) => {
    try {
      await sendPasswordResetEmail(auth, forgotPass)
      toastInfo("Password reset link sent to " + forgotPass)
      return true
    } catch (err) {
      toastError(err.message)
    }
  }



  //login

  const [reData, setReData] = useState({
    email: '',
    password: '',
  })

  const handleReLogin = async (e) => {
    e.preventDefault()

    try {
      await reAuth(reData.password)
        .then(() => {
          toastSuccess("Confirmation is successful!")
          setIsModalOpen(false)
        })
    } catch (err) {
      toastError(err.message)
    }
  }

  //endlogin


  const changeBlogThumb = (file, id) => {
    if (file && (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") && file.size <= 3000000) {

      const storageRef = ref(storage, `/accounts/${user.uid}/p-${id}`)

      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on("state_changed", (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)

        setProgress(prog)
      }, (err) => {
        toastError(err.message)
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => {
            updateDoc(doc(firestore, 'blogs', id), {
              image: url
            })

            router.reload()
          })
      })

      toastInfo("Image is uploading, don't leave from the page.")
    } else if (file.size > 3000000) {
      toastError('Image size is too big! (max 3mb)')
    } else if (file.type !== "image/jpeg" || file.type !== "image/jpg" || file.type !== "image/png") {
      toastError('You can only upload an image!')
    }
  }



  const changeCategoryThumb = (file, id) => {
    if (file && (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") && file.size <= 3000000) {

      const storageRef = ref(storage, `/categories/${id}`)

      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on("state_changed", (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)

        setProgress(prog)
      }, (err) => {
        toastError(err.message)
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => {
            updateDoc(doc(firestore, 'categories', id), {
              image: url
            })
            router.reload()
          })
      })

      toastInfo("Image is uploading, don't leave from the page.")
    } else if (file.size > 3000000) {
      toastError('Image size is too big! (max 3mb)')
    } else if (file.type !== "image/jpeg" || file.type !== "image/jpg" || file.type !== "image/png") {
      toastError('You can only upload an image!')
    }
  }



  const uploadProfileImage = (profilePhoto) => {
    if (profilePhoto && (profilePhoto.type === "image/jpeg" || profilePhoto.type === "image/jpg" || profilePhoto.type === "image/png") && profilePhoto.size <= 3000000) {

      const storageRef = ref(storage, `/accounts/${user.uid}/avatar`)

      const uploadTask = uploadBytesResumable(storageRef, profilePhoto)

      uploadTask.on("state_changed", (snapshot) => {

      }, (err) => {
        toast.error(err.message)
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((photoURL) => {
            updateDoc(doc(firestore, 'accounts', user.uid), {
              imageUrl: photoURL,
            })
            updateProfile(auth.currentUser, { displayName: user.displayName, photoURL })
            router.reload()
          })
      })

      toastInfo("Image is uploading, don't leave from the page.")
    } else if (profilePhoto.size > 3000000) {
      toastError('Image size is too big! (max 3mb)')
    } else if (profilePhoto.type !== "image/jpeg" || file.type !== "image/jpg" || file.type !== "image/png") {
      toastError('You can only upload an image!')
    }
  }


  const deleteImg = (img) => {
    const desertRef = ref(storage, img);

    // Delete the file
    deleteObject(desertRef).catch((error) => {
      
    });
  }


  const getCategories = () => {
    getDocs(query(collection(firestore, 'categories'), orderBy("filterDate", "desc")))
      .then((data) => {
        setCategoriesArray(data.docs.map((item) => {
          return { ...item.data(), id: item.id }
        }));
      })
  }
  useEffect(() => {
    getCategories();
  }, [])



  const getLastUsers = () => {
    getDocs(query(collection(firestore, 'accounts'), orderBy("filterDate", "desc"), limit(10)))
      .then((data) => {
        setLastUsers(data.docs.map((item) => {
          return { ...item.data(), id: item.id }
        }));
      })
  }
  useEffect(() => {
    getLastUsers();
  }, [])




  function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
    charactersLength));
      }
      return result;
    }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, update, handleVerification, handlePassUpdate, fireUser, fireUsers, socialMediaUpdate, forgotPassword, changeBlogThumb, progress, uploadedImgUrl, uploadProfileImage, toastSuccess, toastError, changeCategoryThumb, categoriesArray, deleteImg, getCategories, toastInfo, lastUsers, makeid }}>
      {isModalOpen &&
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <form className='flex flex-col' onSubmit={handleReLogin}>

                      <input
                        onChange={(e) =>
                          setReData({
                            ...reData,
                            password: e.target.value,
                          })
                        }
                        value={reData.password}
                        required
                        type="password"
                        placeholder="Password" />

                      <input type="submit" value="Sign In" />
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      }
      {loading ?
        <div className='h-screen w-full flex items-center justify-center'>
          <BounceLoader color="black" loading="true" size={50} />
        </div>
        :
        children
      }
    </AuthContext.Provider>
  )
}