$scope.office365Login = function() {

let client_id =  "APP_client_ID",
    client_secret = "APP_client_secret",
    tenant_id= "APP_tenant_ID",
    redirect_ur= "http://localhost/callback",
    scopes =  ["offline_access", "openid","https://outlook.office.com/mail.read"],
    accessUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id="+client_id+"&redirect_uri="+redirect_ur+"&response_type=code&scope="+scopes.join(" ",)+"",
    mapiM_url = "https://outlook.office.com/api/v2.0/Me";

    let browserRef = window.cordova.InAppBrowser.open(accessUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

    browserRef.addEventListener("loadstart", function(event) {

     if((event.url).indexOf('http://localhost/callback') === 0) {
        let requestToken = (event.url).split("code=")[1];
       setTimeout(function() { browserRef.close();  }, 10);

          $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: "https://login.microsoftonline.com/"+tenant_id+"/oauth2/v2.0/token", data:
                           "client_id=" + client_id +
                           "&code=" + requestToken +
                           "&client_secret="+  client_secret+
                           "&redirect_uri=http://localhost/callback&" +
                           "grant_type=authorization_code"}).success(function(data) {

             let access_token = data.access_token;

             $http({ method: 'GET',url:  mapiM_url, headers: {
                        "Authorization": "Bearer "+access_token,
                        "Accept": " text/*, multipart/mixed, application/xml, application/json; odata.metadata=none"
                       }

             }).then(function success(response) {

            // console.log(JSON.stringify(response.data))

             let Omymail =response.data.EmailAddress,
                 ODname =response.data.DisplayName;

             console.log("USER NAME: "+ODname+" AND "+"USER MAIL: "+Omymail)

             }, function error(response) {
             browserRef.close();
             console.log(JSON.stringify(response))
             });


         }).error(function(data, status) {
         browserRef.close();
         console.log(JSON.stringify(response))
         })


     }



        })


    }
