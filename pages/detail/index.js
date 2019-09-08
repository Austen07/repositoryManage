import withRepoBasic from '../../components/withRepoBasic';
import dynamic from 'next/dynamic';

const MDrender = dynamic(() => 
  import('../../components/Markdown'), 
  {
    loading: () => <p>Loading Detail...</p>,
  }
);

const api = require("../../lib/api");



const Detail = ({readme}) => {
  return <MDrender content={readme.content} isBase64={true}/>
};

Detail.getInitialProps = async ({ctx}) => {
  const {owner, name} = ctx.query;

  const readmeResult = await api.request({
    url: `/repos/${owner}/${name}/readme`,
  }, ctx.req, ctx.res);

  return {
    readme: readmeResult.data,
  }
}

export default withRepoBasic(Detail, 'index');
