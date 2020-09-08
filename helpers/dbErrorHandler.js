

const uniqueMessage = error => {
    let output;

    try {
      console.log(error)
        console.log(error.message);
        console.log(error.message.lastIndexOf(".$"));
        let fieldName = error.message.substring(
            0,
            error.message.lastIndexOf("_1")
        );
        output =fieldName + " already exists";
    } catch (ex) {
        output = "Unique field already exists";
    }
 
    return output;
};
 
/**
 * Get the erroror message from error object
 */
function errorHandler(error){
    let message = "";
 
    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                message = uniqueMessage(error);
                break;
            default:
                message = "Something went wrong";
        }
    } else {
        for (let errorName in error.errorors) {
            if (error.errorors[errorName].message)
                message = error.errorors[errorName].message;
        }
    }
 
    return message;
};


module.exports = errorHandler