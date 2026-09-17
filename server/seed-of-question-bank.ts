import { importOfQuestionBank } from './ofQuestionBank';

const fileName = process.argv[2] || 'of_cap_objetivo_1_1.json';

importOfQuestionBank(fileName)
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error('Erro na importação OF:', error);
    process.exitCode = 1;
  });
