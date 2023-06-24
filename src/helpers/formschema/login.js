export const mockSchema = [
  {
    $el: 'h2',
    children: 'Log In'
  },
  {
    $formkit: 'text',
    name: 'email',
    label: 'Email',
    validation: 'required|email'
  },
  {
    $formkit: 'password',
    name: 'password',
    label: 'Password',
    validation: 'required'
  },
  {
    type: 'meta',
    data: {
      someTestField: 'Access this elsewhere as $meta.someTestField'
    }
  }
]

export const mockFormdata = {
  email: 'gdeeds@tegbiz.com',
  password: '1234567890'
}
