use html5ever::{parse_document, tendril::TendrilSink, tree_builder::TreeBuilderOpts, ParseOpts};
use markup5ever_rcdom::{Handle, NodeData, RcDom};

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
enum HandleType {
    Open,
    Close,
}

#[test]
fn basic_inner_test() {
    let html = r#"<div><div>hello world</div><div>goodbye world</div></div>"#.to_string();

    let opts = ParseOpts {
        tree_builder: TreeBuilderOpts {
            drop_doctype: true,
            ..Default::default()
        },
        ..Default::default()
    };
    let dom = parse_document(RcDom::default(), opts)
        .from_utf8()
        .read_from(&mut html.as_bytes())
        .unwrap();

    let mut to_visit: Vec<(&Handle, u8, HandleType)> = Vec::new();

    to_visit.push((&dom.document, 0, HandleType::Open));

    let mut res = String::new();
    while let Some((node, indent, handle_type)) = to_visit.pop() {
        for _ in 0..indent {
            res.push(' ');
        }
        match handle_type {
            HandleType::Open => {
                match node.data {
                    // if it's document simply add children
                    NodeData::Document => {}
                    NodeData::Element {
                        ref name,
                        ref attrs,
                        ..
                    } => {
                        res.push('<');
                        res.push_str(&name.local);
                        for attr in attrs.borrow().iter() {
                            res.push(' ');
                            res.push_str(&attr.name.local);
                            res.push_str("=\"");
                            res.push_str(&attr.value);
                            res.push('"');
                        }
                        res.push('>');
                        // to_visit.push((&Handle))
                    }
                    NodeData::Text { ref contents } => {
                        res.push_str(&contents.borrow());
                    }
                    _ => {}
                }
            }
            HandleType::Close => {}
        }
        res.push('\n');
        // print!(" ".);
    }

    assert_eq!(
        res,
        r##"<div>
    <div>hello world</div>
    <div>goodbye world</div>
</div>
    "##
    );
}
