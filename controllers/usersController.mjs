import jsSHA from 'jssha';

export default function initUsersController(db) {
  const loginPage = (req, res) => {
    console.log('Login Page rendered');
    res.render('root');
  }

  const loginDetails = async (req, res) => {
    const { email, password } = req.body;

    const shaObj = new jsSHA('SHA-256', 'TEXT', { encoding: 'UTF8'});
    shaObj.update(password);
    const hashedPassword = shaObj.getHash('HEX');

    try {
      const user = await db.User.findOne({
        where: {
          email
        },
      });

      if (user.password === hashedPassword) {
        res.cookie('userId', user.id);
        res.send('SUCCESS')
      } else {
        res.send('Please re-enter password.')
      }
      
    } catch (err) {
      console.log(err);
    }
  };

  return { loginPage, loginDetails };
}