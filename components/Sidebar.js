import { MdCategory } from 'react-icons/md'
import { BsFillStarFill } from 'react-icons/bs'
import { FaUserPlus } from 'react-icons/fa'
import { GrSearch } from 'react-icons/gr'
import Image from "next/image";
import Link from 'next/link';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'

export default function Sidebar({ search, setSearch, categoriesArray, lastUsers }) {
  dayjs.extend(relativeTime)

  return (
    <div className="w-full flex flex-col gap-14 md:w-1/4 md:pl-32 md:overflow-y-scroll">
        <div className="w-full h-10 relative flex items-center">
            <GrSearch className="absolute left-4 w-4" />
            <input type="text" className="w-full h-full py-4 pl-11 bg-gray-100 text-sm pr-2 rounded-xl focus:outline-none" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        
        <div className="">
            <h4 className="flex items-center gap-2 font-bold">
            <BsFillStarFill />
            Popular Blogs
            </h4>
        </div>

        <div className="flex flex-col">
            <h4 className="flex items-center gap-2 font-bold">
            <MdCategory />
            Categories
            </h4>
            <div className="flex flex-col gap-4 mt-4 md:max-h-48 md:overflow-y-scroll">
            {categoriesArray.map(category =>
                <Link href={"/categories/" + category.link} key={category.id}>
                <a className="flex items-center gap-2 group">
                    <Image width="20px" height="20px" src={category.image} alt="" className="object-cover" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{category.name}</span>
                </a> 
                </Link>
            )}
            </div>
        </div>

        <div className="flex flex-col">
            <h4 className="flex items-center gap-2 font-bold">
            <FaUserPlus />
            Last Members
            </h4>
            <div className="flex flex-col gap-4 mt-4 md:overflow-y-scroll md:max-h-48">
            {lastUsers.map(user =>
                <Link href={"/users/" + user.link} key={user.id}>
                <a className="flex items-center gap-3 group">
                    <Image width="32px" height="32px" src={user ? user.imageUrl : ""} alt="" className="object-cover rounded-full" />
                    <div className="flex justify-center flex-col">
                    <span className="text-sm text-gray-600 transition font-bold group-hover:text-gray-900">{user.displayName}</span>
                    <span className="text-xs text-gray-400 transition group-hover:text-gray-500">{dayjs.unix(user.createdAt.seconds).fromNow()}</span>
                    </div>
                </a> 
                </Link>
            )}
            </div>
        </div>
    </div>
  )
}
