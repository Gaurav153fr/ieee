
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <div className='w-screen h-20 bg-black flex items-center justify-center gap-10'>
        <Link className='text-2xl font-bold text-white' href="/level/1">Level 1</Link>
        <Link className='text-2xl font-bold text-white' href="/level/2">Level 2</Link>

        <Link className='text-2xl font-bold text-white' href="/level/3">Level 3</Link>

    </div>
  )
}

export default Header