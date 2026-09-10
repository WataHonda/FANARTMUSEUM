# FANARTMUSEUM
my fan art museum page src
ダルさん専用Webサイトリソース

## ブランチの管理のルール
1.作業前に必ずdevelopブランチの最新化を行いましょう。
>git pull origin develop
2.用途に合わせてdevelopブランチから開発用のブランチを切ります。
・機能開発：       feature/~
・不具合修正：     fix/~
・ドキュメント関連：docs/~
3.ブランチの切り方
developブランチに移動し、以下のgitコマンドでブランチを切ります。
>git checkout develop
>git pull origin develop
>git checkout -b feature/~