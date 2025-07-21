import React, { Suspense} from 'react'
import SignIn from './sign-in'
import Header from '@/components/header'

function SignInPage() {
  return (
    <>
    <Header pageTitle="Sign In" />
    <Suspense fallback={<div>Loading login...</div>}>
      <SignIn />
    </Suspense>
    </>
  )
}

export default SignInPage