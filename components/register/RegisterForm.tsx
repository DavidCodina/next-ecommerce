// Third-party imports
import { useState, Fragment } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faEyeSlash,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons' // https://github.com/FortAwesome/react-fontawesome
import { createUser } from 'client-api'

/* =============================================================================
                                 RegisterForm 
============================================================================= */

const RegisterForm = () => {
  const router = useRouter()

  const [name, setName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [nameError, setNameError] = useState('')

  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordType, setPasswordType] = useState('password')

  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [confirmPasswordType, setConfirmPasswordType] = useState('password')

  const [registering, setRegistering] = useState(false)

  // Derived state - used to conditionally disable submit button
  const isErrors =
    nameError !== '' ||
    emailError !== '' ||
    passwordError !== '' ||
    confirmPasswordError !== ''
  const allTouched =
    nameTouched && emailTouched && passwordTouched && confirmPasswordTouched

  /* ======================
      validateName()
  ====================== */

  const validateName = (value?: string) => {
    // Gotcha: You can't do value = '' as a default parameter because that will cause
    // the following reassignment to fallback to name state, which in cases of
    // calling the function in the associated onChange will cause a race condition.
    value = typeof value === 'string' ? value : name
    let error = ''

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      error = 'Full name is required.'
      setNameError(error)
      return error
    }

    // Otherwise unset the password error in state and return ''
    setNameError('')
    return ''
  }

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
  validateConfirmPassword()
  ====================== */

  const validateConfirmPassword = (value?: string, passwordValue?: string) => {
    // value represents the confirmPassword value,
    // while password is the original password value.
    value = typeof value === 'string' ? value : confirmPassword
    passwordValue = typeof passwordValue === 'string' ? passwordValue : password
    let error = ''

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      error = 'Password confirmation is required.'
      setConfirmPasswordError(error)
      return error
    }

    if (value !== passwordValue) {
      error = 'The passwords must match.'
      setConfirmPasswordError(error)
      return error
    }

    // Otherwise unset the password error in state and return ''
    setConfirmPasswordError('')
    return ''
  }

  /* ======================
        validate()
  ====================== */

  const validate = () => {
    const errors: string[] = []

    // Set true on all toucher functions.
    const touchers: React.Dispatch<React.SetStateAction<boolean>>[] = [
      setNameTouched,
      setEmailTouched,
      setPasswordTouched,
      setConfirmPasswordTouched
    ]

    touchers.forEach((toucher) => {
      toucher(true)
    })

    const validators: (() => string)[] = [
      validateName,
      validateEmail,
      validatePassword,
      validateConfirmPassword
    ]

    validators.forEach((validator) => {
      const error = validator()
      if (error) {
        errors.push(error)
      }
    })

    // Return early if errors
    if (errors.length >= 1) {
      toast.error('Form validation errors found!')
      return { isValid: false, errors: errors }
    }

    return { isValid: true, errors: null }
  }

  /* ======================
        handleSubmit()
  ====================== */

  const handleSubmit = (e: any) => {
    e.preventDefault()

    const { isValid } = validate()

    // Comment this block out to test server-side validation
    if (!isValid) {
      setPassword('')
      setPasswordType('password')
      setConfirmPassword('')
      setConfirmPasswordType('password')
      return
    }

    // Create newUser...
    // https://www.youtube.com/watch?v=htO0R7zDNV4
    // AmateurPT at 12:15 suggests hashing the password on the client BEFORE
    // sending it in an API request. This would also apply to the login flow.
    // His rationale is that by not hashing on the client, you are vulnerable
    // to a man in the middle attack. I don't know if that's true, but it's
    // worth mentioning...
    const newUser = {
      name: name,
      email: email,
      password: password // Don't trim() this!
    }

    setRegistering(true)

    createUser(newUser)
      .then((res) => {
        if (res?.success === true) {
          setName('')
          setNameTouched(false)
          setEmail('')
          setEmailTouched(false)
          setPassword('')
          setPasswordTouched(false)
          setConfirmPassword('')
          setConfirmPasswordTouched(false)

          // toast.success('Registration success!')

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

          // After registering, redirect user to the LoginPage.
          router.replace('/login')
        } else {
          setPassword('')
          setConfirmPassword('')
          toast.error('Unable to register user!')
        }

        return res
      })
      .catch((err: any) => {
        // When the API request fails, it's likely due to invalid form values.
        // In cases where form data was sent, the API response will also send
        // back an errors object. The createUser() function then normalizes
        // that response data and puts that object on err.errors. The property
        // key for each error will match that of the value sent in the original request.
        if (err?.errors?.name) {
          setNameError(err?.errors?.name)
        }

        if (err?.errors?.email) {
          setEmailError(err?.errors?.email)
        }

        if (err?.errors?.password) {
          setPasswordError(err?.errors?.password)
        }

        // For security reasons, we can also clear the password and confirmPassword.
        else {
          setPassword('')
          setPasswordTouched(false)
        }
        setConfirmPassword('')
        setConfirmPasswordTouched(false)

        toast.error('Unable to register user!')
        return err
      })

      .finally(() => {
        setPasswordType('password')
        setConfirmPasswordType('password')
        setRegistering(false)
      })
  }

  /* ======================
          return
  ====================== */

  return (
    <form
      className='mx-auto my-5 p-3 border border-primary rounded-3'
      style={{ backgroundColor: '#fafafa', maxWidth: 500 }}
    >
      <div className='mb-3'>
        <label className='form-label' htmlFor='name'>
          Name: <sup className='text-danger'>*</sup>
        </label>
        <input
          autoComplete='off'
          className={`form-control form-control-sm${
            !nameTouched ? '' : nameError ? ' is-invalid' : ' is-valid'
          }`}
          id='name'
          name='name'
          onBlur={(e) => {
            if (!nameTouched) {
              setNameTouched(true)
            }
            validateName(e.target.value)
          }}
          onChange={(e) => {
            setName(e.target.value)
            validateName(e.target.value)
          }}
          placeholder='Name...'
          type='text'
          value={name}
        />

        <div className='invalid-feedback'>{nameError}</div>
        {/* <div className='valid-feedback'>Looks good!</div> */}
      </div>

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
          placeholder='Email...'
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
              // Call validateConfirmPassword(), passing in both values as args.
              // This keeps the validation synced at all times.
              validateConfirmPassword(confirmPassword, e.target.value)
            }}
            onChange={(e) => {
              setPassword(e.target.value)
              validatePassword(e.target.value)
              // Call validateConfirmPassword(), passing in both values as args.
              // This keeps the validation synced at all times.
              validateConfirmPassword(confirmPassword, e.target.value)
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
        {/* <div className={`valid-feedback${ passwordTouched && !passwordError ? ' d-block' : ''}`}>Looks good!</div> */}
      </div>

      <div className='mb-3'>
        <label className='form-label' htmlFor='confirm-password'>
          Confirm Password: <sup className='text-danger'>*</sup>
        </label>

        <div className='input-group'>
          <input
            autoComplete='off'
            className={`form-control form-control-sm${
              !confirmPasswordTouched
                ? ''
                : confirmPasswordError
                ? ' is-invalid'
                : ' is-valid'
            }`}
            id='confirm-password'
            name='confirmPassword'
            onBlur={(e) => {
              if (!confirmPasswordTouched) {
                setConfirmPasswordTouched(true)
              }
              validateConfirmPassword(e.target.value)
            }}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              validateConfirmPassword(e.target.value)
            }}
            placeholder='Confirm Password...'
            type={confirmPasswordType}
            value={confirmPassword}
          />

          <button
            className='btn btn-outline-secondary btn-sm bg-white-unimportant'
            type='button'
            onClick={() => {
              setConfirmPasswordType((previousValue) => {
                if (previousValue === 'password') {
                  return 'text'
                }
                return 'password'
              })
            }}
          >
            {confirmPasswordType === 'password' ? (
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
            confirmPasswordTouched && confirmPasswordError ? ' d-block' : ''
          }`}
        >
          {confirmPasswordError}
        </div>
        {/* <div className={`valid-feedback${confirmPasswordTouched && !confirmPasswordError ? ' d-block' : ''}`}>Looks good!</div> */}
      </div>

      {registering ? (
        <button
          className='btn btn-secondary btn-sm fw-bold d-block w-100'
          type='button'
          disabled
        >
          <span
            aria-hidden='true'
            className='spinner-border spinner-border-sm me-2'
            role='status'
          ></span>
          Registering...
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
            'Register'
          )}
        </button>
      )}
    </form>
  )
}

export { RegisterForm }
