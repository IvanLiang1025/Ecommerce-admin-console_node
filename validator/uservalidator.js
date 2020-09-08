

function userValidator(req, res, next){
    req.check("name", "name is required").notEmpty();
    req.check("name", "name must be between 1 to 32 characters")
        .isLength({
            min: 1,
            max: 32
        });
    req.check("email", "Email must be between 3 to 32 characters")
        .matches(/.+\@.+\..+/)
        .withMessage("this is not a correct format for a email")
        .isLength({
            min: 3,
            max: 32
        });
    if(req.body.password){
        req.check("password", "password is required").notEmpty();
        req.check("password")
            .isLength({
                min: 6,
                max: 20
            })
            .withMessage("password must be 6 to 20 in length")
            .matches(/\d/)
            .withMessage("password must contain a number")
    }
   
    const errors = req.validationErrors();
    if(errors){
        const firstError = errors[0].msg;
        return res.status(400).json({error: firstError})
    }

    next();
}

module.exports = userValidator;

