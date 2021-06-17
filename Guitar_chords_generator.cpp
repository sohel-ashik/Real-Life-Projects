#include<iostream>
#include<stdio.h>
#include<algorithm>
#include <string>
#include<stack>
#include<string.h>

using namespace std;

string raw_x[]={"A","A#","B","C","C#","D","D#","E","F","F#","G","G#"};
string minor[]={"min","Maj/min","Maj","min","Maj","Maj","Maj"}; //1 7 6 5
string major[]={"Maj","min","min","Maj","Maj","min","Maj"};  //1 6 4 5 // 1 4 5

int main()
{

    while(1)
    {

    string ch;
    char m_M;
    cout<<"Input chord with (M/m) : ";
    cin>>ch>>m_M;
    if(ch[0]>='a'&&ch[0]<='z')
        ch[0]-=32;
    int terget;
    for(int i=0;i<12;i++)
        if(ch==raw_x[i])
            terget=i;


    string x[12];
    int j=0;
    for(int i=terget;i<12;i++)
    {
        x[j]=raw_x[i];
        j++;
    }
    for(int i=0;i<terget;i++)
    {
        x[j]=raw_x[i];
        j++;

    }

    string a[7];
    if(m_M=='m')
    {
        a[0]=x[0];
        a[1]=x[2];
        a[2]=x[3];
        a[3]=x[5];
        a[4]=x[7];
        a[5]=x[8];
        a[6]=x[10];

    }
    if(m_M=='M')
    {
        a[0]=x[0];
        a[1]=x[2];
        a[2]=x[4];
        a[3]=x[5];
        a[4]=x[7];
        a[5]=x[9];
        a[6]=x[11];
    }

    if(m_M=='m')
    {
        for(int i=0;i<7;i++)
            cout<<a[i]<<" "<<minor[i]<<"\t";
        cout<<endl<<endl<<"Easy version :"<<endl;;
        cout<<a[0]<<" "<<minor[0]<<endl;
        cout<<a[6]<<" "<<minor[6]<<endl;
        cout<<a[5]<<" "<<minor[5]<<endl;
        cout<<a[4]<<" "<<minor[4]<<endl;
    }
    else
    {
        cout<<endl;
        for(int i=0;i<7;i++)
            cout<<a[i]<<" "<<major[i]<<"\t";
        cout<<endl<<endl<<"Easy version :"<<endl;;
        cout<<a[0]<<" "<<major[0]<<endl;
        cout<<a[5]<<" "<<major[5]<<endl;
        cout<<a[3]<<" "<<major[3]<<endl;
        cout<<a[4]<<" "<<major[4]<<endl;

        cout<<"Super easy version :"<<endl;
        cout<<a[0]<<" "<<major[0]<<endl;
        cout<<a[3]<<" "<<major[3]<<endl;
        cout<<a[4]<<" "<<major[4]<<endl;

    }

    }

    return 0;
}
