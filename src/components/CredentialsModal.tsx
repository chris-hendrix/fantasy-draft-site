import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAddUserMutation } from '@/store'
import { useSignIn } from '@/hooks/session'
import { useAlert } from '@/hooks/app'
import TextInput from '@/components/TextInput'
import Modal from '@/components/Modal'
import { getErrorMessage } from '@/utils/error'

interface Props {
  onClose: () => void;
  signUp?: boolean
}

const CredentialsModal: React.FC<Props> = ({ onClose, signUp = false }) => {
  const form = useForm({ mode: 'onChange' })
  const [addUser, {
    error: addUserError,
    isLoading: isAddUserLoading,
  }] = useAddUserMutation()
  const {
    signIn,
    isLoading: isSignInLoading,
    isSuccess: signInSuccess,
    error: signInError
  } = useSignIn()
  const { showAlert } = useAlert()

  const isLoading = isAddUserLoading || isSignInLoading
  const errorMessage = getErrorMessage(addUserError || signInError)

  useEffect(() => {
    if (!signInSuccess) return
    onClose()
    showAlert({ successMessage: 'Successfully signed in' })
  }, [signInSuccess])

  const onSubmit = async (data: { [x: string]: string }) => {
    const { email, password } = data
    const signUpError = signUp && 'error' in await addUser({ email: email.toLocaleLowerCase(), password })
    if (!signUp || !signUpError) await signIn('credentials', { email: email.toLocaleLowerCase(), password })
  }

  return (
    <Modal title={signUp ? 'Sign up' : 'Log in'} onClose={onClose}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextInput name="email" form={form} disabled={isLoading} />
        <TextInput name="password" form={form} disabled={isLoading} validate={!signUp ? () => true : null} />
        {signUp && <TextInput name="confirmPassword" form={form} disabled={isLoading} />}
        <button type="submit" className="btn btn-primary w-full">
          {signUp ? 'Sign up' : 'Log in'}
        </button>
      </form>
      {errorMessage && <div className="mt-2 h-1 text-sm text-red-500">{errorMessage}</div>}
    </Modal>
  )
}

export default CredentialsModal
