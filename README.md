# seriesradar
Site para pesquisar séries e ver a data de estreia, a nota do público e onde assistir. Feito com HTML, CSS e JavaScript puros, sem frameworks e sem chave de API. Os dados vêm da API aberta do TVMaze (https://www.tvmaze.com/api).

🔗 **Demo:** https://saviobruno.github.io/seriesradar/

Funcionalidades
Pesquisa por título enquanto você digita

Sugestões de séries para começar

Cartões com pôster, ano de estreia e nota

Janela de detalhes com data de estreia, nota (0 a 10), situação (em exibição ou encerrada), número de temporadas, sinopse, gêneros e serviço ou canal de origem

Layout responsivo

Como rodar

Não precisa instalar nada. Baixe ou clone o repositório e abra o arquivo index.html no navegador.

git clone https://github.com/saviobruno/seriesradar.git

cd seriesradar


Estrutura

index.html   estrutura da página

style.css    estilos

script.js    busca, lista e detalhes

README.md

API

O projeto usa dois endpoints do TVMaze:

Pesquisa por título: GET https://api.tvmaze.com/search/shows?q={título}

Detalhes e temporadas: GET https://api.tvmaze.com/shows/{id}?embed=seasons

Limitações

Nomes e sinopses vêm em inglês, então a pesquisa deve ser feita pelo título original (por exemplo, "Squid Game").
O campo "onde assistir" mostra apenas o serviço ou canal de origem informado pelo TVMaze, e não todas as plataformas disponíveis em cada país.
A nota é a média dos usuários do TVMaze, não de críticos.
Cobre apenas séries, não filmes.
Créditos

Dados fornecidos pelo TVMaze (https://www.tvmaze.com), sob licença CC BY-SA. Mantenha o crédito ao publicar o projeto.

Licença

Adicione a licença de sua preferência (por exemplo, MIT) em um arquivo LICENSE.
