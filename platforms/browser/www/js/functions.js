let sF = function(tx, res) {};
let eF = function(err) {};
let modal = jQuery('ons-modal');

let login = () => {
    let payload = {
        e: jQuery('#email').val(),
        p: jQuery('#password').val()
    };

    store.verifyUser(payload.e, payload.p, (tx, result) => {
        if(result.rows.length > 0){
            afterLogin(result.rows[0].rowid)
        }else{
            ons.notification.alert('Incorrect email or password.', {title: 'Invalid'});
        }
    }, (tx, err) => {
        console.error(err);
    });
};

let register = () => {
    let password = jQuery('#passkey').val();
    let retypePassword = jQuery('#retype-password').val();

    if(password != retypePassword){
        ons.notification.alert("Password mismatch",{title:"Registration Error"});
        return false;
    }

    let payload = {
        first_name : jQuery('#fname').val(),
        last_name : jQuery('#lname').val(),
        email : jQuery('#email').val(),
        mobile : jQuery('#mobile').val(),
        password : password,
    };


     
    store.createUser(payload, (tx, result)=> {
        afterLogin(result.insertId);
    }, ( tx, err) => {
        console.error(err.message);
    })
};

let afterLogin = (id) => {
    window.localStorage.setItem("user", id);
    let previousState = window.localStorage.getItem("previousState");
    let target = "search.html"
    
    if(previousState != null){
        target = previousState;
        window.localStorage.removeItem("previousState");
    }

    document.querySelector('#navigator').pushPage(target);
};

let logMeOut = () => {
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("role");
    document.querySelector('#navigator').pushPage('home.html', {data: {title: 'Welcome'}});
    ons.notification.alert('You are successfully logged out', {title: 'Logged Out'});
};

let addNewAds = () => {
    let categories = [];
    
    jQuery('.categories-list ons-checkbox input:checked').each((index,elem) => {
        let id = jQuery(elem).attr('id');
        categories.push(jQuery(`label[for=${id}]`).text());
    });

    let travellers = jQuery('#travellers').val();
    let payload = {
        title : jQuery('#title').val(),
        price : jQuery('#price').val(),
        travellers : travellers? travellers: 0 ,
        category : categories.join(', '),
        photo : jQuery('#photo').attr('src'),
    };

    modal.show();
    store.createAds(payload, (tx, result) => {
        ons.notification.alert("Ads has been successfully posted",{title: "Ads Posted"});
        modal.hide();
        document.querySelector('#navigator').pushPage('ads-single.html', {data:{ ads_id: result.insertId} } );
    }, (tx, err) => {
        modal.hide();
        ons.notification.alert(err.message, {title: "Error"});
        console.error(err);
    });
};

let getAdsById = (id, successCB, errorCB) => {
    store.getAdsByID(id, (tx, data)=>{
        if(data.rows.length > 0){
            successCB(data.rows[0]);
        }else{
            errorCB("No Ads found");
        }
    }, (tx, err)=>{
        console.error(err.message);
        errorCB(err.message);
    });
};

let getAllAds = (successCB, errorCB) => {
    store.getAds((tx, data) => {
        if(data.rows.length > 0){
            successCB(data.rows);
        }else{
            successCB(false);
        }
    }, (tx, err) => {
        console.error(err.message);
        errorCB(err.message);
    });
};

let searchAds = (keyword, successCB, errorCB) => {
    store.searchAds(keyword, (tx, data) => {
        if(data.rows.length > 0){
            successCB(data.rows);
        }else{
            successCB(false);
        }
    }, (tx, err) => {
        console.error(err.message);
        errorCB(err.message);
    });
};

let compileList = (results) => {
    output = "<ons-list>";

    for(let i=0; i< results.length; i++ ){
        output += `<ons-list-item tappable class="trip-item" data-id='${results[i].rowid}'>${results[i].title}</ons-list-item>`;
    }
  
    output +="</ons-list>";

    return output;
};

let deleteAds = (ID, successCB=sF, errorCB=eF) => {
    store.deleteAds(ID, (tx, result) => {
        if(result.rowsAffected > 0){
            successCB(result);
        }
    }, (tx, err) => {
        console.error(err.message);
        errorCB(err.message);
    });
};

let requestUpload = () => {
    ons.openActionSheet({
        title: 'Choose Source',
        cancelable: true,
        buttons: ['Gallery','Camera']
    }).then( index => {
        let source = false;
        if(index == 1){
            source = Camera.PictureSourceType.CAMERA;
        }else{
            source = Camera.PictureSourceType.PHOTOLIBRARY;
        }

        uploadImage(source, file => {
            jQuery('.img-preview').attr('src',file);
        },err => {
            console.error(err);
        });
    } );
};

let uploadImage = (source, successCB, errorCB) => {
    let destinationType = navigator.camera.DestinationType;
    navigator.camera.getPicture(successCB, errorCB, {
        quality: 100, // photo quality
        destinationType: destinationType.FILE_URI,
        sourceType: source,
        encodingType: Camera.EncodingType.JPEG
    });
};

