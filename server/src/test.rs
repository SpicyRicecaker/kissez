use crate::*;

#[test]
fn serde_exports() {
    let book: Book = serde_json::from_str(
        r#"{
    "name": "test",
    "url": "http://localhost:3000/bob.html",
    "content": {
      "value": ".content",
      "type": "css"
    },
    "next": {
      "value": "Next:",
      "type": "innerHTML"
    },
    "prev": {
      "value": "Prev:",
      "type": "innerHTML"
    },
    "blacklist": [
      {
        "value": ".simplesocialbuttons",
        "type": "css"
      }
    ]
  }"#,
    )
    .unwrap();

    assert_eq!(
        book,
        Book {
            name: String::from("test"),
            url: String::from("http://localhost:3000/bob.html"),
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
fn serde_exports_2() {
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
