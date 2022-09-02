use actix_files as fs;
use std::{error::Error, path::PathBuf};

use actix_web::{
    get, http::header::ContentType, route, web, App, HttpMessage, HttpRequest, HttpResponse,
    HttpServer, Responder,
};
use serde::Deserialize;

#[derive(Deserialize)]
struct Info {
    url: String,
}

#[get("/curl")]
async fn curl(info: web::Query<Info>, req: HttpRequest) -> Result<impl Responder, Box<dyn Error>> {
    // client code from https://docs.rs/awc/latest/awc/ & discovered on actix github
    let mut client = awc::Client::default();

    let d = client.headers().unwrap();
    // we clone the headers, and I believe that this is legitimate because it
    // basically means that we're a proxy server
    *d = req.headers().clone();

    let req = client.get(&info.url);

    let mut res = req.send().await?;

    let mut builder = HttpResponse::build(res.status());

    res.headers().iter().for_each(|h| {
        builder.append_header(h);
    });

    Ok(HttpResponse::build(res.status()).body(res.body().await?))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(curl)
            .service(fs::Files::new("/", "../dist").index_file("index.html"))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
