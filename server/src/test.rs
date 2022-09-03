use html5ever::{ParseOpts, tree_builder::TreeBuilderOpts, parse_document};

use crate::*;

#[test]
fn serde_exports() {
    let book: Book = serde_json::from_str(
        r#"
  {"name":"LOCALHOSTTEST","url":"http://localhost:8080/bob.html","content":{"value":".content","type":"css"},"next":{"value":"Next:","type":"innerHTML"},"prev":{"value":"Prev:","type":"innerHTML"},"blacklist":[{"value":".simplesocialbuttons","type":"css"}]}
"#,
    )
    .unwrap();

    assert_eq!(
        book,
        Book {
            name: String::from("LOCALHOSTTEST"),
            url: String::from("http://localhost:8080/bob.html"),
            content: Selector::Css {
                value: String::from(".content"),
            },
            next: Selector::InnerHTML {
                value: String::from("Next:"),
            },
            prev: Selector::InnerHTML {
                value: String::from("Prev:"),
            },
            blacklist: vec![Selector::Css {
                value: String::from(".simplesocialbuttons"),
            }]
        }
    )
}

#[test]
fn basic_inner_test () {
    let html = r#"<div>
    <div>hello world</div>
    <div>goodbye world</div>
    </div>"#;

    let opts = ParseOpts {
        tree_builder: TreeBuilderOpts {
            drop_doctype: true,
            ..Default::default()
        },
        ..Default::default()
    };
    // let dom = parse_document(RcDom::default(), opts)
    //     .from_utf8()
    //     .read_from(&mut stdin.lock())
    //     .unwrap()

    // let mut res: Vec<String> = vec![];

    // assert_eq!(res, vec![String::from("hello world"), String::from("goodbye world")]);
    // initial test
}