#install
sudo -H pip install autocrop
npm install
gulp


#pictures
gulp face
autocrop -i tmp/mepphoto -o img/mepphoto -w50 -H50 --facePercent=100

process manually the non detected faces

