npm install
ng build ng-xselect --prod
ng build --prod --base-href=/ng-xselect/demo/
mv dist/ng-xselect-demo ./demo
sed -i -e 's/"name": "ng-xselect"/"name": "@geexarts\/ng-xselect"/g' dist/ng-xselect/package.json
