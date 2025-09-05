# 🚀 Guia de Deploy - Instituto Balbino Fé com Obras

## 📋 Pré-requisitos
- Conta no GitHub
- Repositório configurado
- GitHub Pages ativado

## 🔧 Passos para Deploy

### 1. Upload dos Arquivos
```bash
# Fazer upload de todos os arquivos para o repositório
git add .
git commit -m "Deploy para produção"
git push origin main
```

### 2. Configuração do GitHub Pages
1. Acesse as configurações do repositório
2. Vá em "Pages" no menu lateral
3. Selecione "Deploy from a branch"
4. Escolha "main" branch
5. Pasta: "/ (root)"
6. Salve as configurações

### 3. Verificação
- Acesse: `https://seu-usuario.github.io/institutobalbino`
- Teste todas as funcionalidades
- Verifique responsividade em diferentes dispositivos

## 📁 Estrutura de Arquivos
```
institutobalbino/
├── index.html              # Página inicial
├── pages/                  # Páginas internas
│   ├── sobre.html
│   ├── galeria.html
│   └── contato.html
├── assets/                 # Recursos
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── gallery.js
│   │   └── gallery-mobile.js
│   └── images/             # Imagens e vídeos
├── CNAME                   # Configuração de domínio
└── README.md
```

## ✅ Checklist de Produção
- [x] Logs de debug removidos
- [x] Caminhos de imagens verificados
- [x] Responsividade testada
- [x] Galeria funcionando
- [x] Menu mobile funcionando
- [x] Slideshow otimizado
- [x] Proteção contra extensões implementada

## 🔍 Testes Recomendados
1. **Desktop**: Chrome, Firefox, Safari, Edge
2. **Tablet**: iPad, Android tablets
3. **Mobile**: iPhone, Android phones
4. **Funcionalidades**: Menu, galeria, slideshow, contato

## 📞 Suporte
Em caso de problemas, verifique:
1. Console do navegador para erros
2. Caminhos das imagens
3. Configuração do GitHub Pages
4. Cache do navegador

---
**Desenvolvido com ❤️ para o Instituto Balbino Fé com Obras**
