#include<bits/stdc++.h>
using namespace std;

void merge_to(int a[],int b[],int m,int n)
{
    int x[n+m];
    int i,j,k;
    i=j=k=0;

    for(i=0;i<m;i++)
    {
        if(a[i]<=b[j])
        {
            x[k]=a[i];
            cout<<"i :"<<i<<endl;
            k++;
        }
        else if(a[i]>b[j])
        {
            if(j<n)
            {
                x[k]=b[j];
                cout<<"j :"<<j<<endl;
                j++;
                k++;
                i--;
            }
            else
            {
                x[k]=a[i];
                k++;
            }

        }

    }
    for(int g=0;g<(m+n);g++)
        cout<<x[g]<<" ";
    cout<<endl;
}


int main()
{
    int a[]={45,64,2354,346457},b[]={-65,34,45,674,3462};

    int n=sizeof(a)/sizeof(a[0]);
    int m=sizeof(b)/sizeof(b[0]);

    merge_to(a,b,n,m);

    return 0;
}
