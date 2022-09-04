use actix_files as fs;
// extremely good.
use actix_web::{middleware::Logger, App};
use ammonia::Builder;
use server::Book;
use std::{error::Error, io, slice::Chunks};

use actix_web::{
    error, post,
    web::{self, Bytes, JsonBody},
    HttpRequest, HttpResponse, HttpServer, Responder,
};
// use serde::Deserialize;

// #[derive(Deserialize)]
// struct Info {
//     url: String,
// }

fn parse_html(byte_content: Bytes) -> io::Result<String> {
    // By default, the ammonia defaults listed at
    // https://docs.rs/ammonia/3.2.1/ammonia/struct.Builder.html are already
    // extremely good, blocking the use of buttons as well as basically all
    // non-needed attributes.
    Ok(Builder::new()
        .add_generic_attributes(&["class"])
        .clean_from_reader(byte_content.as_ref())?
        .to_string())
}

#[post("/curl")]
async fn curl(book: web::Json<Book>, req: HttpRequest) -> Result<impl Responder, Box<dyn Error>> {
    // client code from https://docs.rs/awc/latest/awc/ & discovered on actix github
    let mut client = awc::Client::default();

    let d = client.headers().unwrap();
    // we clone the headers, and I believe that this is legitimate because it
    // basically means that we're a proxy server
    *d = req.headers().clone();

    // make request to actual server now
    let req = client.get(&book.url);
    // let req = client.get("/bob.html");

    let mut res = req.send().await?;

    // need to parse
    let body = {
        let byte_content = res.body().await?;
        parse_html(byte_content)?
    };

    let mut builder = HttpResponse::build(res.status());

    res.headers().iter().for_each(|h| {
        builder.append_header(h);
    });

    Ok(HttpResponse::build(res.status()).body(body))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    HttpServer::new(|| {
        App::new()
            .service(curl)
            .service(fs::Files::new("/", "./static").index_file("index.html"))
            .wrap(Logger::new("%a %r %s"))
            .app_data(web::JsonConfig::default().error_handler(|err, _req| {
                error::InternalError::from_response(
                    "",
                    HttpResponse::BadRequest()
                        .content_type("application/json")
                        .body(format!(r#"{{"error":"{}"}}"#, err)),
                )
                .into()
            }))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
