#include<bits/stdc++.h>
using namespace std;


void plaindromeChecker(string a,int x)
{
    static int siz = a.length();
    static int i=0;
    static bool flag = true;
    if(x==siz)
    {
        return;
    }

    plaindromeChecker(a,x+1);
    if(a[x]!=a[i] && flag)
    {
        flag = false;
        cout<<"NOT plaindrome"<<endl;
        return;
        
    }
    i++;

    if(i==siz)
        cout<<"Plaindrome"<<endl;


}


int main()
{
    string a;
    cin>>a;

    plaindromeChecker(a,0);

    return 0;
}
