#include<bits/stdc++.h>
using namespace std;

//134
int count = 0;
void graphic(int up,int down,int left,int right)
{
    system("CLS");
    char x = 'x';

    for(int i=up;i<down;i++)
        cout<<endl;
    for(int i=left;i<right;i++)
        cout<<' ';
    cout<<"x-x"<<endl;
    for(int i=left;i<right;i++)
        cout<<' ';
    cout<<"|x|"<<endl;
    for(int i=left;i<right;i++)
        cout<<' ';
    cout<<"x-x"<<endl;

}
void up_down(int left,int right,int up,int down)
{
    system("CLS");
    char x='x';

    for(int i=up;i<down;i++)
        cout<<endl;
    for(int i=left;i<right;i++)
        cout<<' ';
    cout<<"x-x"<<endl;
    for(int i=left;i<right;i++)
        cout<<' ';
    cout<<"|x|"<<endl;
    for(int i=left;i<right;i++)
        cout<<' ';
    cout<<"x-x"<<endl;
}

int main()
{
    int up = 0;
    int down = 0;
    int left = 0;
    int right = 0;

    
    char ch;
    while(1)
    {
        cin>>ch;
        if(ch == 'a')
        {
            if(right>0)
                right--;
            graphic(up,down,left,right);

        }
        else if(ch == 'd')
        {
            if(right<132)
                right++;
            graphic(up,down,left,right);

        }
        else if(ch == 'w')
        {
            if(down>0)
                down--;
            up_down(left,right,up,down);

        }
        else if(ch == 's')
        {
            if(down<132)
                down++;
            up_down(left,right,up,down);

        }

    }
    


    return 0;
}
