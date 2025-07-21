import React, { Suspense } from 'react'
import Verify from './verify'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Verify />
    </Suspense>
  )
}

export default page