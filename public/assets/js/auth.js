/* $(function(){
    $("#login-form").submit(function(e){
        let email = $("input[name='email']").val();
        let password = $("input[name='password']").val();
        console.log(email, password);
        if (email && password){
            console.log("ajaxing");
            $.ajax({
                method: "POST",
                url: "/auth/login",
                data: {email, password},
            })
            .done(function(res){
                $.ajax({
                    method: "GET",
                    url: `/user/${res.user._id}`,
                    headers: {
                        "Authorization": `Bearer ${res.token}`
                    }
                })
                .done(function(res){
                    $('html').html(res);
                    // console.log(res);
                })
            })
        }
        return false
    });
}) */