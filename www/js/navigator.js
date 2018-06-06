jQuery(document).on('init', event => {
  let page = event.target;
  let elem = jQuery(page);
  let nav = jQuery('#navigator')[0];
  let titleBar = elem.find('.toolbar .card-title');
  let modal = jQuery('ons-modal');

  switch(page.id){
    case 'register':
      jQuery(document).on('change', '#agree-terms-condition', event => {
        if(jQuery(event.currentTarget).prop('checked')){
          jQuery('#btn-register').prop('disabled', false);
        }else{
          jQuery('#btn-register').prop('disabled', true);
        }
      });
    break;

    case 'search':
      getAllAds(result => {
        let output = `<ons-list-title>All Ads</ons-list-title>\n`;
        if(result){
          output += compileList(result);
          jQuery('#results').html(output);
        }
      }, err => {});

      jQuery(document).on('input', '#search-input', event => {
        let keyword = jQuery(event.currentTarget).val();
        if(keyword.length > 2){
          searchAds( keyword, result => {
            let total = 0;
            if(result){
              total = result.length;
            }

            let output = `<ons-list-title>${total} ads found for <strong>${keyword}</strong></ons-list-title>\n`;
            
            if(result){
              output += compileList(result);
            }else{
              output += `<p>No ads found for <strong>${keyword}</strong>`;
            }
            
            jQuery('#results').html(output);

          }, err => {
            ons.notification.alert(err, {title: "Error"});
          })
        }
      });
    break;

    case 'ads-single':
      let id = page.data.ads_id;
      modal.show();
      getAdsById(id, result => {
        jQuery('#photo').attr('src', result.photo);
        jQuery('#categories').html(result.category);
        jQuery('#title').html(result.title);
        jQuery('#price > .content').html(result.price);
        jQuery('#travellers > .content').html(result.travellers);
        jQuery('#delete-ads').attr('data-id',result.rowid);
        modal.hide();
      }, err => {
        modal.hide();
        ons.notification.alert(err, {title: "Error"});
      } ); 

      jQuery(document).on('tap', '#delete-ads', event => {
        let id = jQuery(event.currentTarget).attr('data-id');
        
        ons.notification.confirm('Are you sure?', { 
          title: 'You are about to delete an ads', 
          buttonLabels: ["No", "Yes"]
        }).then( response => {
          if(response){
            modal.show();
            deleteAds(id, result => {
              modal.hide();
              ons.notification.alert("The ads was deleted successfully", {title: "Deleted"});
              nav.pushPage('home.html');
            }, err => {
              modal.hide();
              ons.notification.alert(err, {title: "Error"});
            });
          }
        });
      });
      
    break;
  }
});

let navigate = target => {
  let nav = jQuery('#navigator')[0];
  let user = window.localStorage.getItem("user");  
  if(target == 'post-ads.html' && user == null ){
    window.localStorage.setItem("previousState", target);
    nav.pushPage('login.html');
  } else{
    nav.pushPage(target);
  }
}