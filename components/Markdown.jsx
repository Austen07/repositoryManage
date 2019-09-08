import MarkdownIt from 'markdown-it';
import 'github-markdown-css';
import {memo, useMemo} from 'react';

const md = new MarkdownIt({
  html: true,
  linkify: true
});


const b64_to_utf8 = (str) => {
  return decodeURIComponent(escape(atob(str)));
};

//optimize 
export default memo(({content, isBase64}) => {
  const markdown = isBase64 ? b64_to_utf8(content) : content;
  const html = useMemo(() => md.render(markdown), [markdown]);

  return(
    <div className="markdown-body">
      <div dangerouslySetInnerHTML={{__html: html}} />
    </div>
  );
});
