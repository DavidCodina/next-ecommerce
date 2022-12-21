// Third-party imports
import React, { useState, Fragment } from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faEyeSlash,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons' // https://github.com/FortAwesome/react-fontawesome

interface ILoginForm {
  style?: React.CSSProperties
}

/* =============================================================================
                                LoginForm 
============================================================================= */

const LoginForm = ({ style }: ILoginForm) => {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [loggingIn, setLoggingIn] = useState(false)
  const [passwordType, setPasswordType] = useState('password')

  // Derived state - used to conditionally disable submit button
  const isErrors = emailError !== '' || passwordError !== ''
  const allTouched = emailTouched && passwordTouched

  /* ======================
      validateEmail()
  ====================== */
  // This validation function is used by validate(), which is called in handleSubmit().
  // It's also used within the email <input>'s onChange and onBlur handlers. When used
  // by the <input> the value is passed as an argument to avoid race conditions. When
  // used in the handleSubmit() the value argument is omitted, and the value is instead
  // derived from the local state.

  const validateEmail = (value?: string) => {
    // Gotcha: You can't do value = '' as a default parameter because that will cause
    // the following reassignment to fallback to email state, which in cases of
    // calling the function in the associated onChange will cause a race condition.
    value = typeof value === 'string' ? value : email
    let error = ''

    // This regex is taken directly from:
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation
    // However, you may still need to turn off ESLint's: no-useless-escape
    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      error = 'An email is required.'
      setEmailError(error)
      return error
    }

    if (!regex.test(value)) {
      error = 'A valid email is required.'
      setEmailError(error)
      return error
    }

    // Otherwise unset the email error in state and return ''
    setEmailError('')
    return ''
  }

  /* ======================
    validatePassword()
  ====================== */

  const validatePassword = (value?: string) => {
    // Gotcha: You can't do value = '' as a default parameter because that will cause
    // the following reassignment to fallback to password state, which in cases of
    // calling the function in the associated onChange will cause a race condition.
    value = typeof value === 'string' ? value : password
    let error = ''

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      error = 'A password is required.'
      setPasswordError(error)
      return error
    }

    // Otherwise unset the password error in state and return ''
    setPasswordError('')
    return ''
  }

  /* ======================
        validate()
  ====================== */

  const validate = () => {
    const errors: string[] = []

    // Set true on all toucher functions.
    const touchers: React.Dispatch<React.SetStateAction<boolean>>[] = [
      setEmailTouched,
      setPasswordTouched
    ]

    touchers.forEach((toucher) => {
      toucher(true)
    })

    const validators: (() => string)[] = [validateEmail, validatePassword]

    validators.forEach((validator) => {
      const error = validator()
      if (error) {
        errors.push(error)
      }
    })

    // Return early if errors
    if (errors.length >= 1) {
      // console.log('Returning early from handleSubmit() because of errors.', errors)
      toast.error('Form validation errors found!')
      return { isValid: false, errors: errors }
    }

    return { isValid: true, errors: null }
  }

  /* ======================
        handleSubmit()
  ====================== */

  const handleSubmit /*:React.FormEventHandler<HTMLFormElement> */ = async (
    e: any
  ) => {
    e.preventDefault()

    const { isValid } = validate()

    // Currently, [...nextauth].ts doesn't have any additional validation
    // that checks for empty ('') email or password. It doesn't really need
    // it. If the user doesn't enter the correct credentials, it will fail
    // all the same.
    if (!isValid) {
      setPassword('')
      setPasswordType('password')
      return
    }

    setLoggingIn(true)

    // Note: The Promise will always resolve. It will not be rejected - even if we have an error.
    const res: any = await signIn('credentials', {
      // redirect:false prevents redirection when throwing an error from [...nextauth].ts code.
      // It may also prevent redirection on success. If you set it to true, then
      // you'll also want to include callbackUrl: '/dashboard' (or whatever).
      // The redirect property is more important when using other providers/strategies.
      redirect: false,
      email: email,
      password: password
    })

    ////////////////////////////////////////////////////////////////////////////////
    //
    // If it fails we will get a result resembling something like this:
    //   { error: "CredentialsSignin", ok: false, status: 401, url: null}
    //
    // If it succeeds, we will get something like this:
    //   {error: null, status: 200, ok: true, url: 'http://localhost:3000/login'}
    //
    // Thus we can react accordingly.
    //
    ////////////////////////////////////////////////////////////////////////////////
    if (res.status === 200) {
      setEmail('')
      setEmailTouched(false)
      setPassword('')
      setPasswordTouched(false)

      // toast.success('Login success!')

      ////////////////////////////////////////////////////////////////////////////////
      //
      // Ultimately, we want to redirect the user if they are logged in (i.e. is session).
      // One approach to this would be to implement useSession() in PageLogin to
      // check if the user is logged in, and if so always redirect them.
      // However, that approach has a potential downside. If we're checking status === 'loading',
      // then it can result in a loading UI flash. Consequently that page instead uses
      // the server side check to redirect the user.
      //
      // However, that check only runs on mount, so in this case we actually do
      // need to manually redirect the user here.
      //
      ////////////////////////////////////////////////////////////////////////////////
      router.replace('/')
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(res)
      }

      // Reset emailTouched, password, passwordTouched. In this case,
      // we're not setting any field-specific errors. It's better to be opaque.
      setEmailTouched(false)
      setPassword('')
      setPasswordTouched(false)

      toast.error(
        "Unable to log in! Please make sure you're using the correct credentials."
      )
    }

    setPasswordType('password')
    setLoggingIn(false)
  }

  /* ======================
          return
  ====================== */
  // This form validates each field on submit, onBlur, and onChange (if touched).
  // Implementing validation is a lot of work, but taking the time to do it
  // correctly leads to the best user experience. Ultimately, this process can
  // be simplified through abstracting some of the logic into custom form field
  // components and/or using Formik/react-hook-form. For now, it's all homegrown.

  return (
    <div className='mx-auto' style={{ maxWidth: 500, ...style }}>
      <form
        className='p-3 border border-primary rounded-3'
        style={{ backgroundColor: '#fafafa' }}
      >
        <div className='mb-3'>
          <label className='form-label' htmlFor='email'>
            Email: <sup className='text-danger'>*</sup>
          </label>
          <input
            autoComplete='off'
            className={`form-control form-control-sm${
              !emailTouched ? '' : emailError ? ' is-invalid' : ' is-valid'
            }`}
            id='email'
            name='email'
            onBlur={(e) => {
              if (!emailTouched) {
                setEmailTouched(true)
              }
              validateEmail(e.target.value)
            }}
            onChange={(e) => {
              setEmail(e.target.value)
              validateEmail(e.target.value)
            }}
            placeholder='Email'
            type='email'
            value={email}
          />

          <div className='invalid-feedback'>{emailError}</div>
          {/* <div className='valid-feedback'>Looks good!</div> */}
        </div>

        <div className='mb-3'>
          <label className='form-label' htmlFor='password'>
            Password: <sup className='text-danger'>*</sup>
          </label>

          <div className='input-group'>
            <input
              autoComplete='off'
              className={`form-control form-control-sm${
                !passwordTouched
                  ? ''
                  : passwordError
                  ? ' is-invalid'
                  : ' is-valid'
              }`}
              id='password'
              name='password'
              onBlur={(e) => {
                if (!passwordTouched) {
                  setPasswordTouched(true)
                }
                validatePassword(e.target.value)
              }}
              onChange={(e) => {
                setPassword(e.target.value)
                validatePassword(e.target.value)
              }}
              placeholder='Password...'
              type={passwordType}
              value={password}
            />

            <button
              className='btn btn-outline-secondary btn-sm bg-white-unimportant'
              type='button'
              onClick={() => {
                setPasswordType((previousValue) => {
                  if (previousValue === 'password') {
                    return 'text'
                  }
                  return 'password'
                })
              }}
            >
              {passwordType === 'password' ? (
                <FontAwesomeIcon icon={faEye} />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} />
              )}
            </button>
          </div>

          {/* Because of the way that Bootstrap validation classes work, .*-feedback classes
          fail to inherit display:block when they are not direct siblings of the input. 
          In other words, the CSS breaks down when .input-group is used. In such cases, we
          need to assign them manually. */}
          <div
            className={`invalid-feedback${
              passwordTouched && passwordError ? ' d-block' : ''
            }`}
          >
            {passwordError}
          </div>
          {/* <div className={`valid-feedback${passwordTouched && !passwordError ? ' d-block' : ''}`}>Looks good!</div> */}
        </div>

        {loggingIn ? (
          <button
            className='btn btn-secondary btn-sm fw-bold d-block w-100'
            disabled
            type='button'
          >
            <span
              aria-hidden='true'
              className='spinner-border spinner-border-sm me-2'
              role='status'
            ></span>
            Logging In...
          </button>
        ) : (
          <button
            className='btn btn-secondary btn-sm fw-bold d-block w-100'
            // The submit button is disabled here when there are errors, but
            // only when all fields have been touched. All fields will have
            // been touched either manually or after the first time the button
            // has been clicked.
            disabled={allTouched && isErrors ? true : false}
            onClick={handleSubmit}
            type='button'
          >
            {allTouched && isErrors ? (
              <Fragment>
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  style={{ marginRight: 5 }}
                />{' '}
                Please Fix Errors...
              </Fragment>
            ) : (
              'Log In'
            )}
          </button>
        )}
      </form>
    </div>
  )
}

export { LoginForm }
