import React from 'react'
import { Suspense } from 'react'
import ResetPassword from './reset'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  )
}

export default page