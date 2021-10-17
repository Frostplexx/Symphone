function auothorizeSpotify() {

    const app = express();
    app.get('/login', (req, res) => {
        res.redirect(spotifyApi.createAuthorizeURL(scopes));
    });



    app.get('/callback', (req, res) => {
        const error = req.query.error;
        const code = req.query.code;
        if (error) {
            console.error('Callback Error:', error);
            res.send(`Callback Error: ${error}`);
            return;
        }



        spotifyApi
            .authorizationCodeGrant(code)
            .then(data => {
                const access_token = data.body['access_token'];
                const refresh_token = data.body['refresh_token'];
                const expires_in = data.body['expires_in'];

                spotifyApi.setAccessToken(access_token);
                spotifyApi.setRefreshToken(refresh_token);
                console.log('access_token:', access_token);
                console.log('refresh_token:', refresh_token);
                console.log(
                    `Sucessfully retreived access token. Expires in ${expires_in} s.`
                );
                res.send('Symphone was successfully authorized! You can now close this window');
                setInterval(async () => {
                    let data1 = await spotifyApi.refreshAccessToken();
                    let access_token1 = data1.body['access_token'];
                    console.log('The access token has been refreshed!');
                    console.log('access_token:', access_token1);
                    spotifyApi.setAccessToken(access_token1);
                }, expires_in / 2 * 1000);

            })
            .catch(error => {

                console.error('Error getting Tokens:', error);

                res.send(`Error getting Tokens: ${error}`);

            });
        return true

    });
    app.listen(8888, () =>
        console.log(
         'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
        )

    );

}